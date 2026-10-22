import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, users, scores } from "@/db";
import { eq } from "drizzle-orm";
import { validateSession } from "@/lib/auth";
import { fetchLiveMaimaiScores, transformExternalScore } from "@/lib/maimai-api";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("maimai_session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication session missing" },
        { status: 401 }
      );
    }

    const user = await validateSession(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Fetch live score payload from external API simulator (or real scraper in prod)
    const extData = await fetchLiveMaimaiScores(user.segaId);

    // Perform transaction to ensure profile & scores are updated atomically
    await db.transaction(async (tx) => {
      // 1. Update user profile statistics
      await tx
        .update(users)
        .set({
          nickname: extData.profile.nickname,
          rating: extData.profile.rating,
          trophy: extData.profile.trophy,
          plate: extData.profile.plate,
          syncTime: Date.now(),
        })
        .where(eq(users.id, user.id));

      // 2. Upsert each individual score into local SQLite database
      for (const extScore of extData.scores) {
        const transformed = transformExternalScore(user.id, extScore);
        
        await tx
          .insert(scores)
          .values(transformed)
          .onConflictDoUpdate({
            target: scores.id,
            set: {
              achievement: transformed.achievement,
              clearType: transformed.clearType,
              liked: transformed.liked,
              playCount: transformed.playCount,
              level: transformed.level,
              difficulty: transformed.difficulty,
            },
          });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Data synchronization complete",
    });
  } catch (error: any) {
    console.error("Sync API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Synchronization failed" },
      { status: 500 }
    );
  }
}

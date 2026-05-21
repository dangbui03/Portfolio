import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { createSession, getSessionCookieOptions } from "@/lib/auth";
import { fetchLiveMaimaiScores } from "@/lib/maimai-api";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { segaId, password } = await request.json();

    if (!segaId || !password) {
      return NextResponse.json(
        { success: false, error: "SEGA ID and credentials are required" },
        { status: 400 }
      );
    }

    // Verify/Check if user already exists in our local SQLite database
    let userResult = await db
      .select()
      .from(users)
      .where(eq(users.segaId, segaId))
      .limit(1);

    let userId: string;

    if (userResult.length === 0) {
      // First time logging in: we perform a live sync to pull nickname and rating
      const extData = await fetchLiveMaimaiScores(segaId);
      
      userId = crypto.randomUUID();

      await db.insert(users).values({
        id: userId,
        segaId,
        nickname: extData.profile.nickname,
        rating: extData.profile.rating,
        trophy: extData.profile.trophy,
        plate: extData.profile.plate,
        syncTime: Date.now(),
      });
    } else {
      userId = userResult[0].id;
    }

    // Create session token (storing it in Drizzle ORM SQLite)
    const token = await createSession(userId);

    // Set 10-day HTTP-only secure cookie
    const cookieOpts = getSessionCookieOptions();
    const cookieStore = await cookies();
    cookieStore.set(cookieOpts.name, token, {
      maxAge: cookieOpts.maxAge,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
    });

    return NextResponse.json({
      success: true,
      message: "Authentication established",
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Authentication process failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, scores } from "@/db";
import { eq, and } from "drizzle-orm";
import { validateSession } from "@/lib/auth";

export async function POST(request: Request) {
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

    const { scoreId, liked } = await request.json();

    if (!scoreId) {
      return NextResponse.json(
        { success: false, error: "Score ID is required" },
        { status: 400 }
      );
    }

    // Update liked state in SQLite ensuring security scoping to active user
    await db
      .update(scores)
      .set({
        liked: liked ? 1 : 0,
      })
      .where(and(eq(scores.id, scoreId), eq(scores.userId, user.id)));

    return NextResponse.json({
      success: true,
      message: "Score liked state updated successfully",
    });
  } catch (error: any) {
    console.error("Like toggle API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update like status" },
      { status: 500 }
    );
  }
}

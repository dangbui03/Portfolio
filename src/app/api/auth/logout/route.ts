import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("maimai_session")?.value;

    if (token) {
      await destroySession(token);
    }

    // Delete the session cookie by setting its maxAge to 0 or calling delete
    cookieStore.delete("maimai_session");

    return NextResponse.json({
      success: true,
      message: "Session terminated successfully",
    });
  } catch (error: any) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Logout process failed" },
      { status: 500 }
    );
  }
}

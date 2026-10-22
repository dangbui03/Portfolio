import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, users, scores } from "@/db";
import { eq } from "drizzle-orm";
import { validateSession } from "@/lib/auth";
import DashboardClient from "./DashboardClient";
import { GravityProvider } from "@/components/visual/GravityPhysics";
import { SpaceParticles } from "@/components/visual/SpaceParticles";

// Force dynamic rendering to ensure cookies are read live and up-to-date
export const dynamic = "force-dynamic";

export default async function MaimaiDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("maimai_session")?.value;

  if (!token) {
    redirect("/maimai");
  }

  const sessionUser = await validateSession(token);
  if (!sessionUser) {
    redirect("/maimai");
  }

  // Fetch updated user profile data
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .limit(1);

  const user = userResult[0];

  // Fetch all score matrices associated with this user
  const scoreRecords = await db
    .select()
    .from(scores)
    .where(eq(scores.userId, sessionUser.id));

  return (
    <GravityProvider>
      <SpaceParticles />
      <main className="min-h-screen w-full flex flex-col relative bg-space-950 text-slate-100 antialiased overflow-x-hidden">
        <DashboardClient user={user} initialScores={scoreRecords} />
      </main>
    </GravityProvider>
  );
}

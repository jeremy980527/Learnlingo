import { ensureUserRecord } from "@/lib/auth/ensure-user-record";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export interface CurrentAppUser {
  id: string;
  email: string;
  displayName: string | null;
  xpTotal: number;
  streakDays: number;
}

export async function getCurrentAppUser(): Promise<CurrentAppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  await ensureUserRecord(user);

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  return {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.displayName,
    xpTotal: dbUser.xpTotal,
    streakDays: dbUser.streakDays,
  };
}

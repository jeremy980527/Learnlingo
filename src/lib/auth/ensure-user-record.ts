import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";

export async function ensureUserRecord(user: User) {
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    null;

  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? undefined },
    create: {
      id: user.id,
      email: user.email ?? `${user.id}@unknown.local`,
      displayName,
    },
  });
}

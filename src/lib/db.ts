import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL 尚未設定。請在 .env.local 中設定 Supabase Postgres 連線字串後再存取資料庫。",
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * 延遲初始化：只有在真正呼叫資料庫方法時才建立連線，
 * 讓沒有設定 DATABASE_URL 的環境（例如尚未串接 Supabase 的預覽/展示模式）
 * 仍然可以完成建置與啟動。
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    return Reflect.get(client as object, prop, receiver);
  },
});

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

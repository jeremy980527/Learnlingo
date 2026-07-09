"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("密碼至少需要 8 個字元。");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "註冊時發生未知錯誤，請稍後再試。",
      );
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <AuthLayout
        title="請檢查你的信箱"
        subtitle="我們寄了一封驗證信給你"
        footer={
          <Link href="/login" className="font-extrabold text-secondary-600">
            返回登入頁
          </Link>
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 py-4 text-center"
        >
          <CheckCircle2 size={48} className="text-primary-500" />
          <p className="text-sm font-semibold text-ink-700">
            我們已將驗證連結寄至 <span className="font-extrabold">{email}</span>
            ，請點擊信中連結完成註冊。
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="建立帳號"
      subtitle="上傳你的教材，開始遊戲化學習"
      footer={
        <>
          已經有帳號了？{" "}
          <Link href="/login" className="font-extrabold text-secondary-600">
            前往登入
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="displayName">暱稱</Label>
          <Input
            id="displayName"
            type="text"
            required
            autoComplete="nickname"
            placeholder="你想被怎麼稱呼？"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">電子信箱</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">密碼</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="至少 8 個字元"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-2xl bg-red-100 px-4 py-3 text-sm font-bold text-red-600"
          >
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </motion.div>
        ) : null}

        <Button type="submit" fullWidth isLoading={isLoading}>
          註冊
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-200" />
        <span className="text-xs font-bold uppercase text-ink-300">或</span>
        <div className="h-px flex-1 bg-ink-200" />
      </div>

      <GoogleButton label="使用 Google 帳號註冊" />
    </AuthLayout>
  );
}

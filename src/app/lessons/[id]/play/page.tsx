import { AlertTriangle } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { LessonPlayPageClient } from "@/components/lesson/lesson-play-page-client";
import { getLessonView } from "@/lib/materials/get-lesson-view";
import { createClient } from "@/lib/supabase/server";

export default async function LessonPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <AlertTriangle className="text-red-500" size={40} />
        <p className="font-bold text-ink-700">
          Supabase 尚未設定，無法讀取關卡內容。
        </p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/lessons/${id}/play`);
  }

  const lesson = await getLessonView(id, user.id);

  if (!lesson) {
    notFound();
  }

  if (lesson.status === "LOCKED") {
    redirect(`/materials/${lesson.materialId}/map`);
  }

  return <LessonPlayPageClient lesson={lesson} />;
}

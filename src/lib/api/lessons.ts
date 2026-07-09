export interface CompleteLessonPayload {
  stars: number;
  correctCount: number;
  totalCount: number;
}

export interface CompleteLessonResponse {
  xpEarned: number;
  xpTotal: number;
  streakDays: number;
  nextLessonId: string | null;
}

export async function completeLesson(
  lessonId: string,
  payload: CompleteLessonPayload,
): Promise<CompleteLessonResponse> {
  const response = await fetch(`/api/lessons/${lessonId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "無法儲存學習進度。");
  }

  return body as CompleteLessonResponse;
}

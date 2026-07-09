import { z } from "zod";

export const questionTypeSchema = z.enum([
  "MULTIPLE_CHOICE",
  "FILL_BLANK",
  "MATCHING",
  "REORDER",
]);

export const multipleChoicePayloadSchema = z.object({
  options: z.array(z.string().min(1)).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

export const fillBlankPayloadSchema = z.object({
  textWithBlank: z.string().min(1),
  correctAnswer: z.string().min(1),
  hints: z.array(z.string()).optional(),
});

export const matchingPayloadSchema = z.object({
  pairs: z
    .array(
      z.object({
        left: z.string().min(1),
        right: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
});

export const reorderPayloadSchema = z.object({
  tokens: z.array(z.string().min(1)).min(2).max(10),
  correctOrder: z.array(z.number().int().min(0)),
});

export const questionSchema = z.object({
  id: z.string(),
  type: questionTypeSchema,
  order: z.number().int().min(0),
  prompt: z.string().min(1),
  payload: z.union([
    multipleChoicePayloadSchema,
    fillBlankPayloadSchema,
    matchingPayloadSchema,
    reorderPayloadSchema,
  ]),
});

export const lessonTypeSchema = z.enum([
  "NEW_CONCEPT",
  "REVIEW",
  "TEST",
  "BOSS",
]);

export const lessonSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: lessonTypeSchema,
  order: z.number().int().min(0),
  xpReward: z.number().int().min(5).max(100),
  questions: z.array(questionSchema).min(1),
});

export const unitSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().min(0),
  icon: z.string().default("book"),
  colorTheme: z.enum(["primary", "secondary", "gold", "purple", "red"]),
  lessons: z.array(lessonSchema).min(1),
});

export const generatedMapSchema = z.object({
  materialTitle: z.string().min(1),
  summary: z.string().optional(),
  units: z.array(unitSchema).min(1),
});

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type LessonType = z.infer<typeof lessonTypeSchema>;
export type MultipleChoicePayload = z.infer<typeof multipleChoicePayloadSchema>;
export type FillBlankPayload = z.infer<typeof fillBlankPayloadSchema>;
export type MatchingPayload = z.infer<typeof matchingPayloadSchema>;
export type ReorderPayload = z.infer<typeof reorderPayloadSchema>;
export type GeneratedQuestion = z.infer<typeof questionSchema>;
export type GeneratedLesson = z.infer<typeof lessonSchema>;
export type GeneratedUnit = z.infer<typeof unitSchema>;
export type GeneratedMap = z.infer<typeof generatedMapSchema>;

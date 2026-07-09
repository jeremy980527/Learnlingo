import { getLearningMapProvider } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { extractTextFromFile } from "@/lib/parsing";
import { createAdminClient, MATERIALS_BUCKET } from "@/lib/supabase/admin";
import {
  generatedMapSchema,
  type FillBlankPayload,
  type GeneratedQuestion,
  type MatchingPayload,
  type MultipleChoicePayload,
  type ReorderPayload,
} from "@/lib/validations/learning-map";

async function markFailed(materialId: string, errorMessage: string) {
  await prisma.material.update({
    where: { id: materialId },
    data: { status: "FAILED", errorMessage },
  });
}

export async function processMaterial(materialId: string): Promise<void> {
  const material = await prisma.material.findUnique({ where: { id: materialId } });

  if (!material) {
    throw new Error(`找不到教材 ${materialId}`);
  }

  try {
    await prisma.material.update({
      where: { id: materialId },
      data: { status: "PARSING" },
    });

    const supabaseAdmin = createAdminClient();
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(MATERIALS_BUCKET)
      .download(material.storagePath);

    if (downloadError || !fileData) {
      throw new Error(`無法從儲存空間下載檔案：${downloadError?.message ?? "未知錯誤"}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const rawText = await extractTextFromFile(buffer, material.fileType);

    if (rawText.trim().length < 10) {
      throw new Error("解析出的文字內容過短，請確認上傳的教材是否包含可辨識的文字。");
    }

    await prisma.material.update({
      where: { id: materialId },
      data: { rawText, status: "GENERATING" },
    });

    const provider = getLearningMapProvider();
    const generatedMap = generatedMapSchema.parse(
      await provider.generateLearningMap({
        rawText,
        materialFilename: material.filename,
      }),
    );

    await prisma.$transaction(async (tx) => {
      for (const unit of generatedMap.units) {
        const createdUnit = await tx.unit.create({
          data: {
            materialId: material.id,
            title: unit.title,
            description: unit.description,
            order: unit.order,
            icon: unit.icon,
            colorTheme: unit.colorTheme,
          },
        });

        for (const lesson of unit.lessons) {
          const createdLesson = await tx.lesson.create({
            data: {
              unitId: createdUnit.id,
              title: lesson.title,
              type: lesson.type,
              order: lesson.order,
              xpReward: lesson.xpReward,
            },
          });

          for (const question of lesson.questions) {
            await tx.question.create({
              data: {
                lessonId: createdLesson.id,
                type: question.type,
                order: question.order,
                prompt: question.prompt,
                payload: question.payload,
                answer: extractAnswer(question),
              },
            });
          }

          const isFirstLesson = unit.order === 0 && lesson.order === 0;
          await tx.userProgress.create({
            data: {
              userId: material.userId,
              lessonId: createdLesson.id,
              status: isFirstLesson ? "AVAILABLE" : "LOCKED",
            },
          });
        }
      }

      await tx.material.update({
        where: { id: materialId },
        data: { status: "READY" },
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知的處理錯誤";
    await markFailed(materialId, message);
    throw error;
  }
}

function extractAnswer(question: GeneratedQuestion) {
  switch (question.type) {
    case "MULTIPLE_CHOICE": {
      const payload = question.payload as MultipleChoicePayload;
      return { correctIndex: payload.correctIndex };
    }
    case "FILL_BLANK": {
      const payload = question.payload as FillBlankPayload;
      return { correctAnswer: payload.correctAnswer };
    }
    case "MATCHING": {
      const payload = question.payload as MatchingPayload;
      return { pairs: payload.pairs };
    }
    case "REORDER": {
      const payload = question.payload as ReorderPayload;
      return { correctOrder: payload.correctOrder };
    }
    default:
      return {};
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { generatedMapSchema, type GeneratedMap } from "@/lib/validations/learning-map";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { AiGenerationError, type LearningMapProvider } from "./types";

const TOOL_NAME = "generate_learning_map";

const TOOL_INPUT_SCHEMA: Anthropic.Tool.InputSchema = {
  type: "object",
  properties: {
    materialTitle: { type: "string" },
    summary: { type: "string" },
    units: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          order: { type: "integer", minimum: 0 },
          icon: { type: "string" },
          colorTheme: {
            type: "string",
            enum: ["primary", "secondary", "gold", "purple", "red"],
          },
          lessons: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                type: {
                  type: "string",
                  enum: ["NEW_CONCEPT", "REVIEW", "TEST", "BOSS"],
                },
                order: { type: "integer", minimum: 0 },
                xpReward: { type: "integer", minimum: 5, maximum: 100 },
                questions: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      type: {
                        type: "string",
                        enum: [
                          "MULTIPLE_CHOICE",
                          "FILL_BLANK",
                          "MATCHING",
                          "REORDER",
                        ],
                      },
                      order: { type: "integer", minimum: 0 },
                      prompt: { type: "string" },
                      payload: {
                        description:
                          "依 type 決定的內容：MULTIPLE_CHOICE 需要 options(array,2-6) 與 correctIndex(number)；FILL_BLANK 需要 textWithBlank 與 correctAnswer；MATCHING 需要 pairs(array of {left,right})；REORDER 需要 tokens(array) 與 correctOrder(array of number)。",
                        type: "object",
                      },
                    },
                    required: ["id", "type", "order", "prompt", "payload"],
                  },
                },
              },
              required: ["id", "title", "type", "order", "xpReward", "questions"],
            },
          },
        },
        required: ["id", "title", "order", "icon", "colorTheme", "lessons"],
      },
    },
  },
  required: ["materialTitle", "units"],
};

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AiGenerationError(
      "ANTHROPIC_API_KEY 尚未設定，無法呼叫 Claude API 生成學習地圖。",
    );
  }
  return new Anthropic({ apiKey });
}

async function callClaude(
  rawText: string,
  materialFilename: string,
  retryFeedback?: string,
): Promise<unknown> {
  const client = getClient();
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

  const userContent = retryFeedback
    ? `${buildUserPrompt(rawText, materialFilename)}\n\n上一次的輸出未通過驗證，錯誤如下，請修正後重新產生：\n${retryFeedback}`
    : buildUserPrompt(rawText, materialFilename);

  const response = await client.messages.create({
    model,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
    tools: [
      {
        name: TOOL_NAME,
        description:
          "回傳一套完整的遊戲化學習地圖，包含單元、關卡與題目。",
        input_schema: TOOL_INPUT_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: TOOL_NAME },
  });

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );

  if (!toolUseBlock) {
    throw new AiGenerationError("Claude 未回傳預期的工具呼叫結果。");
  }

  return toolUseBlock.input;
}

export const claudeLearningMapProvider: LearningMapProvider = {
  name: "claude",

  async generateLearningMap({ rawText, materialFilename }): Promise<GeneratedMap> {
    let lastError: string | undefined;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = await callClaude(rawText, materialFilename, lastError);
        const parsed = generatedMapSchema.safeParse(raw);

        if (parsed.success) {
          return parsed.data;
        }

        lastError = parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");
      } catch (error) {
        if (error instanceof AiGenerationError) throw error;
        throw new AiGenerationError("呼叫 Claude API 時發生錯誤。", error);
      }
    }

    throw new AiGenerationError(
      `Claude 回傳的資料未通過結構驗證：${lastError ?? "未知錯誤"}`,
    );
  },
};

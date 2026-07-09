import { clamp, generateId } from "@/lib/utils";
import type {
  FillBlankPayload,
  GeneratedLesson,
  GeneratedQuestion,
  GeneratedUnit,
  LessonType,
  MatchingPayload,
  MultipleChoicePayload,
  ReorderPayload,
} from "@/lib/validations/learning-map";
import type { LearningMapProvider } from "./types";

const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "your", "with", "this",
  "that", "from", "have", "has", "was", "were", "will", "would", "can",
  "could", "should", "into", "onto", "than", "then", "them", "they", "there",
  "their", "what", "when", "where", "which", "who", "whom", "why", "how",
  "also", "such", "some", "each", "more", "most", "very", "just", "about",
  "these", "those", "its", "it's", "our", "we", "in", "on", "of", "to", "a",
  "an", "is", "it", "as", "at", "by", "or", "be",
]);

const COLOR_THEMES: GeneratedUnit["colorTheme"][] = [
  "primary",
  "secondary",
  "gold",
  "purple",
  "red",
];

const TERM_REGEX = /\p{Script=Han}{2,6}|\p{L}[\p{L}\p{N}'-]{2,}/gu;

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[。！？.!?\n])/u)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 4);
}

function extractTerms(sentence: string): string[] {
  const matches = sentence.match(TERM_REGEX) ?? [];
  return matches.filter((word) => {
    if (/^\p{Script=Han}+$/u.test(word)) return true;
    return word.length >= 4 && !STOPWORDS.has(word.toLowerCase());
  });
}

function pickLongestTerm(sentence: string): string | null {
  const terms = extractTerms(sentence);
  if (terms.length === 0) return null;
  return terms.reduce((longest, term) =>
    term.length > longest.length ? term : longest,
  );
}

function chunkArray<T>(items: T[], chunkCount: number): T[][] {
  const size = Math.ceil(items.length / chunkCount);
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function tokenizeForReorder(sentence: string): string[] {
  const cleaned = sentence.replace(/[。！？.!?]+$/u, "");
  if (/\s/.test(cleaned.trim())) {
    return cleaned.split(/\s+/).filter(Boolean);
  }
  const chars = Array.from(cleaned);
  const tokens: string[] = [];
  for (let i = 0; i < chars.length; i += 2) {
    tokens.push(chars.slice(i, i + 2).join(""));
  }
  return tokens.filter((t) => t.length > 0);
}

function mostFrequentTerm(sentences: string[]): string {
  const counts = new Map<string, number>();
  for (const sentence of sentences) {
    for (const term of extractTerms(sentence)) {
      counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }
  let best = "";
  let bestCount = 0;
  for (const [term, count] of counts) {
    if (count > bestCount) {
      best = term;
      bestCount = count;
    }
  }
  return best || sentences[0]?.slice(0, 12) || "重點整理";
}

function buildMultipleChoice(
  sentence: string,
  termBank: string[],
  order: number,
): GeneratedQuestion | null {
  const term = pickLongestTerm(sentence);
  if (!term) return null;

  const distractorPool = termBank.filter(
    (candidate) => candidate.toLowerCase() !== term.toLowerCase(),
  );
  const distractors = shuffle(distractorPool).slice(0, 3);
  if (distractors.length < 1) return null;

  const options = shuffle([term, ...distractors]);
  const correctIndex = options.indexOf(term);

  const payload: MultipleChoicePayload = { options, correctIndex };

  return {
    id: generateId("q"),
    type: "MULTIPLE_CHOICE",
    order,
    prompt: `以下哪一個詞最適合填入句子中？「${sentence.replace(term, "___")}」`,
    payload,
  };
}

function buildFillBlank(sentence: string, order: number): GeneratedQuestion | null {
  const term = pickLongestTerm(sentence);
  if (!term) return null;

  const payload: FillBlankPayload = {
    textWithBlank: sentence.replace(term, "___"),
    correctAnswer: term,
    hints: [`共 ${term.length} 個字`],
  };

  return {
    id: generateId("q"),
    type: "FILL_BLANK",
    order,
    prompt: "請填入空格中缺少的詞彙",
    payload,
  };
}

function buildMatching(sentences: string[], order: number): GeneratedQuestion | null {
  const pairs = sentences
    .map((sentence) => {
      const term = pickLongestTerm(sentence);
      if (!term) return null;
      const remainder = sentence.replace(term, "").trim().slice(0, 26) || sentence.slice(0, 26);
      return { left: term, right: remainder };
    })
    .filter((pair): pair is { left: string; right: string } => pair !== null)
    .slice(0, 4);

  if (pairs.length < 2) return null;

  const payload: MatchingPayload = { pairs };

  return {
    id: generateId("q"),
    type: "MATCHING",
    order,
    prompt: "請將左右兩側的內容配對起來",
    payload,
  };
}

function buildReorder(sentence: string, order: number): GeneratedQuestion | null {
  const tokens = tokenizeForReorder(sentence);
  if (tokens.length < 3) return null;

  const correctOrder = tokens.map((_, index) => index);
  const shuffledIndexes = shuffle(correctOrder);

  const payload: ReorderPayload = {
    tokens: shuffledIndexes.map((i) => tokens[i]),
    correctOrder: correctOrder.map((originalIndex) =>
      shuffledIndexes.indexOf(originalIndex),
    ),
  };

  return {
    id: generateId("q"),
    type: "REORDER",
    order,
    prompt: "請將下列詞彙重新排列成正確的句子",
    payload,
  };
}

function buildQuestionsForLesson(
  lessonSentences: string[],
  termBank: string[],
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  const usedPrompts = new Set<string>();

  const perSentenceBuilders = [
    (sentence: string) => buildMultipleChoice(sentence, termBank, questions.length),
    (sentence: string) => buildFillBlank(sentence, questions.length),
    (sentence: string) => buildReorder(sentence, questions.length),
  ];

  const targetCount = clamp(lessonSentences.length + 2, 4, 8);

  outer: for (const sentence of lessonSentences) {
    for (const builder of perSentenceBuilders) {
      if (questions.length >= targetCount) break outer;
      const question = builder(sentence);
      if (question && !usedPrompts.has(question.prompt)) {
        usedPrompts.add(question.prompt);
        questions.push(question);
      }
    }
  }

  if (questions.length < targetCount) {
    const matching = buildMatching(lessonSentences, questions.length);
    if (matching && !usedPrompts.has(`${matching.prompt}:${JSON.stringify(matching.payload)}`)) {
      usedPrompts.add(`${matching.prompt}:${JSON.stringify(matching.payload)}`);
      questions.push(matching);
    }
  }

  return questions.map((q, index) => ({ ...q, order: index }));
}

function resolveLessonType(
  lessonIndexInUnit: number,
  isLastLessonInUnit: boolean,
  unitIndex: number,
): LessonType {
  if (isLastLessonInUnit) {
    return unitIndex > 0 && (unitIndex + 1) % 3 === 0 ? "BOSS" : "TEST";
  }
  return lessonIndexInUnit % 2 === 0 ? "NEW_CONCEPT" : "REVIEW";
}

function xpForLessonType(type: LessonType): number {
  switch (type) {
    case "BOSS":
      return 30;
    case "TEST":
      return 20;
    case "REVIEW":
      return 15;
    default:
      return 10;
  }
}

function deriveMaterialTitle(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  return withoutExt.length > 0 ? withoutExt : "未命名教材";
}

export const mockLearningMapProvider: LearningMapProvider = {
  name: "mock-heuristic",

  async generateLearningMap({ rawText, materialFilename }) {
    const sentences = splitSentences(rawText);

    if (sentences.length === 0) {
      throw new Error("教材內容過短或無法解析出有效句子，請確認上傳的檔案內容。");
    }

    const termBank = Array.from(
      new Set(sentences.flatMap((sentence) => extractTerms(sentence))),
    );

    const unitCount = clamp(Math.ceil(sentences.length / 10), 2, 6);
    const sentenceGroups = chunkArray(sentences, unitCount).filter(
      (group) => group.length > 0,
    );

    const units: GeneratedUnit[] = sentenceGroups.map((groupSentences, unitIndex) => {
      const lessonCount = clamp(Math.ceil(groupSentences.length / 6), 2, 5);
      const lessonSentenceGroups = chunkArray(groupSentences, lessonCount).filter(
        (group) => group.length > 0,
      );

      const lessons: GeneratedLesson[] = lessonSentenceGroups.map(
        (lessonSentences, lessonIndex) => {
          const isLast = lessonIndex === lessonSentenceGroups.length - 1;
          const type = resolveLessonType(lessonIndex, isLast, unitIndex);

          return {
            id: generateId("lesson"),
            title: `第 ${lessonIndex + 1} 關｜${mostFrequentTerm(lessonSentences)}`,
            type,
            order: lessonIndex,
            xpReward: xpForLessonType(type),
            questions: buildQuestionsForLesson(lessonSentences, termBank),
          };
        },
      );

      return {
        id: generateId("unit"),
        title: `第 ${unitIndex + 1} 單元｜${mostFrequentTerm(groupSentences)}`,
        description: groupSentences[0]?.slice(0, 60),
        order: unitIndex,
        icon: "book",
        colorTheme: COLOR_THEMES[unitIndex % COLOR_THEMES.length],
        lessons,
      };
    });

    return {
      materialTitle: deriveMaterialTitle(materialFilename),
      summary: sentences.slice(0, 2).join(" "),
      units,
    };
  },
};

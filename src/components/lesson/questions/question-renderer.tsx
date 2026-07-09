import { FillBlankQuestion } from "./fill-blank-question";
import { MatchingQuestion } from "./matching-question";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { ReorderQuestion } from "./reorder-question";
import type { QuestionComponentProps } from "./types";

export function QuestionRenderer(props: QuestionComponentProps) {
  switch (props.question.type) {
    case "MULTIPLE_CHOICE":
      return <MultipleChoiceQuestion {...props} />;
    case "FILL_BLANK":
      return <FillBlankQuestion {...props} />;
    case "MATCHING":
      return <MatchingQuestion {...props} />;
    case "REORDER":
      return <ReorderQuestion {...props} />;
    default:
      return null;
  }
}

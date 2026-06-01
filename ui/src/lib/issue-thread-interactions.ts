export type {
  AskUserQuestionsAnswer,
  AskUserQuestionsInteraction,
  AskUserQuestionsPayload,
  AskUserQuestionsQuestion,
  AskUserQuestionsQuestionOption,
  AskUserQuestionsResult,
  IssueThreadInteraction,
  IssueThreadInteractionActorFields,
  IssueThreadInteractionBase,
  IssueThreadInteractionContinuationPolicy,
  IssueThreadInteractionStatus,
  RequestConfirmationInteraction,
  RequestConfirmationIssueDocumentTarget,
  RequestConfirmationPayload,
  RequestConfirmationResult,
  RequestConfirmationTarget,
  SuggestedTaskDraft,
  SuggestTasksInteraction,
  SuggestTasksPayload,
  SuggestTasksResult,
  SuggestTasksResultCreatedTask,
} from "@paperclipai/shared";
import type { TFunction } from "i18next";
import type {
  AskUserQuestionsAnswer,
  AskUserQuestionsInteraction,
  AskUserQuestionsQuestion,
  IssueThreadInteraction,
  RequestConfirmationInteraction,
  SuggestedTaskDraft,
  SuggestTasksInteraction,
  SuggestTasksResultCreatedTask,
} from "@paperclipai/shared";

export interface SuggestedTaskTreeNode {
  task: SuggestedTaskDraft;
  children: SuggestedTaskTreeNode[];
}

export function isIssueThreadInteraction(
  value: unknown,
): value is IssueThreadInteraction {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<IssueThreadInteraction>;
  return typeof candidate.id === "string"
    && typeof candidate.companyId === "string"
    && typeof candidate.issueId === "string"
    && (
      candidate.kind === "suggest_tasks"
      || candidate.kind === "ask_user_questions"
      || candidate.kind === "request_confirmation"
    );
}

export function buildIssueThreadInteractionSummary(
  interaction: IssueThreadInteraction,
  t?: TFunction,
) {
  if (interaction.kind === "suggest_tasks") {
    const count = interaction.payload.tasks.length;
    if (interaction.status === "accepted") {
      const createdCount = interaction.result?.createdTasks?.length ?? 0;
      const skippedCount = interaction.result?.skippedClientKeys?.length ?? 0;
      if (skippedCount > 0) {
        return t?.("components.issueChat.interactions.acceptedSomeTasks", {
          createdCount,
          count,
          defaultValue: "Accepted {{createdCount}} of {{count}} tasks",
        }) ?? `Accepted ${createdCount} of ${count} tasks`;
      }
      return t?.("components.issueChat.interactions.acceptedTasks", {
        count: createdCount,
        defaultValue: createdCount === 1 ? "Accepted 1 task" : `Accepted ${createdCount} tasks`,
      }) ?? (createdCount === 1 ? "Accepted 1 task" : `Accepted ${createdCount} tasks`);
    }
    if (interaction.status === "rejected") {
      return t?.("components.issueChat.interactions.rejectedTasks", {
        count,
        defaultValue: count === 1 ? "Rejected 1 task" : `Rejected ${count} tasks`,
      }) ?? (count === 1 ? "Rejected 1 task" : `Rejected ${count} tasks`);
    }
    return t?.("components.issueChat.interactions.suggestedTasks", {
      count,
      defaultValue: count === 1 ? "Suggested 1 task" : `Suggested ${count} tasks`,
    }) ?? (count === 1 ? "Suggested 1 task" : `Suggested ${count} tasks`);
  }

  if (interaction.kind === "request_confirmation") {
    if (interaction.status === "accepted") return t?.("components.issueChat.interactions.confirmedRequest", { defaultValue: "Confirmed request" }) ?? "Confirmed request";
    if (interaction.status === "rejected") return t?.("components.issueChat.interactions.declinedRequest", { defaultValue: "Declined request" }) ?? "Declined request";
    if (interaction.status === "expired") {
      const outcome = interaction.result?.outcome;
      if (outcome === "superseded_by_comment") return t?.("components.issueChat.interactions.confirmationExpiredAfterComment", { defaultValue: "Confirmation expired after comment" }) ?? "Confirmation expired after comment";
      if (outcome === "stale_target") return t?.("components.issueChat.interactions.confirmationExpiredAfterTargetChanged", { defaultValue: "Confirmation expired after target changed" }) ?? "Confirmation expired after target changed";
      return t?.("components.issueChat.interactions.confirmationExpired", { defaultValue: "Confirmation expired" }) ?? "Confirmation expired";
    }
    return t?.("components.issueChat.interactions.requestedConfirmation", { defaultValue: "Requested confirmation" }) ?? "Requested confirmation";
  }

  const count = interaction.payload.questions.length;
  if (interaction.status === "answered") {
    return t?.("components.issueChat.interactions.answeredQuestions", {
      count,
      defaultValue: count === 1 ? "Answered 1 question" : `Answered ${count} questions`,
    }) ?? (count === 1 ? "Answered 1 question" : `Answered ${count} questions`);
  }
  if (interaction.status === "cancelled") {
    return t?.("components.issueChat.interactions.cancelledQuestions", {
      count,
      defaultValue: count === 1 ? "Cancelled 1 question" : `Cancelled ${count} questions`,
    }) ?? (count === 1 ? "Cancelled 1 question" : `Cancelled ${count} questions`);
  }
  return t?.("components.issueChat.interactions.askedQuestions", {
    count,
    defaultValue: count === 1 ? "Asked 1 question" : `Asked ${count} questions`,
  }) ?? (count === 1 ? "Asked 1 question" : `Asked ${count} questions`);
}

export function buildSuggestedTaskTree(
  tasks: readonly SuggestedTaskDraft[],
): SuggestedTaskTreeNode[] {
  const nodes = new Map<string, SuggestedTaskTreeNode>();
  for (const task of tasks) {
    nodes.set(task.clientKey, { task, children: [] });
  }

  const roots: SuggestedTaskTreeNode[] = [];
  for (const task of tasks) {
    const node = nodes.get(task.clientKey);
    if (!node) continue;
    const parentNode = task.parentClientKey ? nodes.get(task.parentClientKey) : null;
    if (parentNode) {
      parentNode.children.push(node);
      continue;
    }
    roots.push(node);
  }

  return roots;
}

export function countSuggestedTaskNodes(node: SuggestedTaskTreeNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countSuggestedTaskNodes(child), 0);
}

export function collectSuggestedTaskClientKeys(node: SuggestedTaskTreeNode): string[] {
  return [
    node.task.clientKey,
    ...node.children.flatMap((child) => collectSuggestedTaskClientKeys(child)),
  ];
}

export function getQuestionAnswerLabels(args: {
  question: AskUserQuestionsQuestion;
  answers: readonly AskUserQuestionsAnswer[];
}) {
  const { question, answers } = args;
  const selectedIds =
    answers.find((answer) => answer.questionId === question.id)?.optionIds ?? [];
  const optionLabelById = new Map(
    question.options.map((option) => [option.id, option.label] as const),
  );
  return selectedIds
    .map((optionId) => optionLabelById.get(optionId))
    .filter((label): label is string => typeof label === "string");
}

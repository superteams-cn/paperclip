import { useCallback } from "react";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import type { IssueRetryNowOutcome, IssueRetryNowResponse } from "@paperclipai/shared";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ApiError } from "../api/client";
import { issuesApi } from "../api/issues";
import { useToastActions } from "../context/ToastContext";
import { queryKeys } from "../lib/queryKeys";
import { formatApiError } from "../lib/api-error";
import { formatIssueRetryNowMessage } from "../lib/api-feedback-format";

export type RetryNowError = {
  message: string;
  outcomeMessage: string | null;
  status: number | null;
};

function readErrorMessage(error: unknown, t: TFunction): string {
  const fallback = error instanceof ApiError
    ? t("common.requestFailedWithStatus", {
      status: error.status,
      defaultValue: "Request failed ({{status}})",
    })
    : t("common.requestFailedTryAgain", { defaultValue: "The request failed. Try again in a moment." });
  return formatApiError(error, t, fallback);
}

export const RETRY_NOW_OUTCOME_HEADLINE: Record<IssueRetryNowOutcome, string> = {
  promoted: "Retry promoted",
  already_promoted: "Retry already running",
  no_scheduled_retry: "No scheduled retry",
  gate_suppressed: "Couldn't retry now",
};

export function useRetryNowMutation(
  issueId: string | null | undefined,
): UseMutationResult<IssueRetryNowResponse, unknown, void, unknown> & {
  lastError: RetryNowError | null;
} {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { pushToast } = useToastActions();

  const mutation = useMutation({
    mutationFn: () => {
      if (!issueId) throw new Error("Missing issue id");
      return issuesApi.retryScheduledRetryNow(issueId);
    },
    onSuccess: (response) => {
      if (issueId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.activity(issueId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.runs(issueId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.liveRuns(issueId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.activeRun(issueId) });
      }
      if (response.outcome === "promoted") {
        pushToast({
          title: t("pages.issues.scheduledRetry.retryPromoted", {
            defaultValue: RETRY_NOW_OUTCOME_HEADLINE.promoted,
          }),
          body: formatIssueRetryNowMessage(response, t),
          tone: "success",
        });
      } else if (response.outcome === "gate_suppressed") {
        pushToast({
          title: t("pages.issues.scheduledRetry.couldNotRetry", {
            defaultValue: RETRY_NOW_OUTCOME_HEADLINE.gate_suppressed,
          }),
          body: formatIssueRetryNowMessage(response, t),
          tone: "error",
        });
      }
    },
    onError: (error) => {
      pushToast({
        title: t("pages.issues.scheduledRetry.couldNotRetry", { defaultValue: "Couldn't retry now" }),
        body: readErrorMessage(error, t),
        tone: "error",
      });
    },
  });

  const reset = mutation.reset;
  const wrappedReset = useCallback(() => reset(), [reset]);

  const lastError: RetryNowError | null = (() => {
    if (mutation.error) {
      const apiError = mutation.error instanceof ApiError ? mutation.error : null;
      return {
        message: readErrorMessage(mutation.error, t),
        outcomeMessage: null,
        status: apiError?.status ?? null,
      };
    }
    if (mutation.data && mutation.data.outcome === "gate_suppressed") {
      const message = formatIssueRetryNowMessage(mutation.data, t);
      return {
        message,
        outcomeMessage: message,
        status: null,
      };
    }
    return null;
  })();

  return {
    ...mutation,
    reset: wrappedReset,
    lastError,
  } as UseMutationResult<IssueRetryNowResponse, unknown, void, unknown> & {
    lastError: RetryNowError | null;
  };
}

import { useCallback } from "react";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import type { IssueRetryNowResponse } from "@paperclipai/shared";
import { useTranslation } from "react-i18next";
import { ApiError } from "../api/client";
import { issuesApi } from "../api/issues";
import { useToastActions } from "../context/ToastContext";
import { formatApiError } from "../lib/api-error";
import { formatIssueRetryNowMessage } from "../lib/api-feedback-format";
import { queryKeys } from "../lib/queryKeys";

export type RetryNowError = {
  message: string;
  outcomeMessage: string | null;
  status: number | null;
};

export function useRetryNowMutation(
  issueId: string | null | undefined,
): UseMutationResult<IssueRetryNowResponse, unknown, void, unknown> & {
  lastError: RetryNowError | null;
} {
  const queryClient = useQueryClient();
  const { pushToast } = useToastActions();
  const { t } = useTranslation();

  const readErrorMessage = (error: unknown) => formatApiError(
    error,
    t,
    t("common.requestFailedTryAgain", { defaultValue: "The request failed. Try again in a moment." }),
  );

  const mutation = useMutation({
    mutationFn: () => {
      if (!issueId) {
        throw new Error(t("common.apiErrors.missingRequiredField", {
          defaultValue: "A required field is missing or invalid.",
        }));
      }
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
          title: t("pages.issues.scheduledRetry.retryPromoted", { defaultValue: "Retry promoted" }),
          body: formatIssueRetryNowMessage(response, t),
          tone: "success",
        });
      } else if (response.outcome === "gate_suppressed") {
        pushToast({
          title: t("pages.issues.scheduledRetry.couldNotRetry", { defaultValue: "Couldn't retry now" }),
          body: formatIssueRetryNowMessage(response, t),
          tone: "error",
        });
      }
    },
    onError: (error) => {
      pushToast({
        title: t("pages.issues.scheduledRetry.couldNotRetry", { defaultValue: "Couldn't retry now" }),
        body: readErrorMessage(error),
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
        message: readErrorMessage(mutation.error),
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

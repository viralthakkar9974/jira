import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddCommentVariables {
  attachmentId: string;
  comment: string;
}

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attachmentId, comment }: AddCommentVariables) => {
      const response = await fetch(
        `/api/task-attachments/${attachmentId}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment }),
        }
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to add comment");
      }
      const { data } = await response.json();
      return data;
    },
    onSuccess: (_data, variables) => {
      toast.success("Comment sent!");
      queryClient.invalidateQueries({
        queryKey: ["attachment-comments", variables.attachmentId],
      });
    },
    onError: () => {
      toast.error("Failed to send comment.");
    },
  });
};

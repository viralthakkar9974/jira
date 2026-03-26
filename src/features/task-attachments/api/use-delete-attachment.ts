import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseDeleteAttachmentProps {
  taskId: string;
}

export const useDeleteAttachment = ({ taskId }: UseDeleteAttachmentProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const response = await fetch(`/api/task-attachments/${attachmentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete attachment");
      return response.json();
    },
    onSuccess: () => {
      toast.success("File deleted");
      queryClient.invalidateQueries({
        queryKey: ["task-attachments", taskId],
      });
    },
    onError: () => {
      toast.error("Failed to delete file");
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      file,
    }: {
      taskId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/task-attachments/${taskId}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        let message = "Upload failed";
        try { message = JSON.parse(text).error ?? message; } catch {}
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      toast.success("File uploaded!");
      queryClient.invalidateQueries({
        queryKey: ["task-attachments", variables.taskId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Upload failed");
    },
  });
};

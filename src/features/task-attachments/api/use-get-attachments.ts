import { useQuery } from "@tanstack/react-query";

interface UseGetAttachmentsProps {
  taskId: string;
}

export const useGetAttachments = ({ taskId }: UseGetAttachmentsProps) => {
  return useQuery({
    queryKey: ["task-attachments", taskId],
    queryFn: async () => {
      const response = await fetch(`/api/task-attachments/${taskId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch attachments");
      }
      const { data } = await response.json();
      return data;
    },
    enabled: !!taskId,
  });
};

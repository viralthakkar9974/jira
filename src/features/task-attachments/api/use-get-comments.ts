import { useQuery } from "@tanstack/react-query";

interface UseGetCommentsProps {
  attachmentId: string;
}

export const useGetComments = ({ attachmentId }: UseGetCommentsProps) => {
  return useQuery({
    queryKey: ["attachment-comments", attachmentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/task-attachments/${attachmentId}/comments`,
        { credentials: "include" }
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch comments");
      }
      const { data } = await response.json();
      return data;
    },
    enabled: !!attachmentId,
  });
};

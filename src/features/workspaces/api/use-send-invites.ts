import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface SendInvitesProps {
  workspaceId: string;
  emails: string[];
}

export const useSendInvites = () => {
  return useMutation({
    mutationFn: async ({ workspaceId, emails }: SendInvitesProps) => {
      const response = await fetch(`/api/workspaces/${workspaceId}/send-invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      if (!response.ok) throw new Error("Failed to send invites");
      return response.json();
    },
    onSuccess: (_, { emails }) => {
      toast.success(`Invite sent to ${emails.length} email(s)!`);
    },
    onError: () => {
      toast.error("Failed to send invites. Please try again.");
    },
  });
};
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DottedSeparator } from "@/components/dotted-separator";
import { useWorkspceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useSendInvites } from "@/features/workspaces/api/use-send-invites";
import { Loader, MailIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

export const InviteClient = () => {
  const workspaceId = useWorkspceId();
  const [emails, setEmails] = useState("");
  const { data: workspace } = useGetWorkspace({ workspaceId });
  const { mutate, isPending } = useSendInvites();

  const fullInviteLink = workspace ? `${typeof window !== "undefined" ? window.location.origin : ""}/workspaces/${workspace.$id}/join/${workspace.inviteCode}` : "";

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(fullInviteLink).then(() => {
      toast.success("Invite link copied to clipboard");
    });
  };

  const handleSubmit = () => {
    const emailList = emails
      .split(/[\s,]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@") && e.includes("."));

    if (emailList.length === 0) {
      toast.error("Please enter at least one valid email");
      return;
    }

    mutate(
      { workspaceId, emails: emailList },
      { onSuccess: () => setEmails("") }
    );
  };

  return (
    <div className="flex flex-col gap-y-4 max-w-2xl">
      <Card className="w-full border shadow-sm">
        <CardHeader className="p-7">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <MailIcon className="size-5" />
            Invite Members
          </CardTitle>
          <CardDescription>
            Admin only. Enter email addresses and an invite link will be sent to each one.
          </CardDescription>
        </CardHeader>
        <DottedSeparator />
        <CardContent className="p-7 flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <p className="text-sm font-semibold">Invite Link</p>
            <div className="flex items-center gap-x-2">
              <Input
                readOnly
                value={fullInviteLink}
                className="bg-muted text-muted-foreground"
              />
              <Button
                onClick={handleCopyInviteLink}
                variant="secondary"
                disabled={!fullInviteLink}
                className="shrink-0"
              >
                <CopyIcon className="size-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          <DottedSeparator className="my-2" />
          <Textarea
            placeholder={`john@gmail.com jane@gmail.com\nor one per line`}
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={6}
            disabled={isPending}
          />
          <p className="text-sm text-muted-foreground">
            Separate multiple emails with a space, comma, or new line.
          </p>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full lg:w-auto"
            >
              {isPending && <Loader className="size-4 animate-spin mr-2" />}
              Send Invites
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
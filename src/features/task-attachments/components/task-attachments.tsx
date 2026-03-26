"use client";

import { useRef, useState } from "react";
import {
  UploadIcon,
  DownloadIcon,
  Trash2Icon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  Loader2,
  PaperclipIcon,
  MessageSquareIcon,
  SendIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Task } from "@/features/tasks/types";
import { MemberRole } from "@/features/members/types";
import { useWorkspceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCurrent } from "@/features/auth/api/use-current";

import { useGetAttachments } from "../api/use-get-attachments";
import { useUploadAttachment } from "../api/use-upload-attachment";
import { useDeleteAttachment } from "../api/use-delete-attachment";
import { useGetComments } from "../api/use-get-comments";
import { useAddComment } from "../api/use-add-comment";
import { TaskAttachment, AttachmentComment } from "../types";

interface TaskAttachmentsProps {
  task: Task;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/"))
    return <ImageIcon className="size-5 text-blue-500" />;
  if (mimeType === "application/pdf")
    return <FileTextIcon className="size-5 text-red-500" />;
  return <FileIcon className="size-5 text-muted-foreground" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Comment Dialog (shown to admin when they click the comment button) ────────

interface CommentDialogProps {
  attachment: TaskAttachment;
  onClose: () => void;
}

function CommentDialog({ attachment, onClose }: CommentDialogProps) {
  const [text, setText] = useState("");
  const { mutate: addComment, isPending } = useAddComment();

  const handleSubmit = () => {
    if (!text.trim()) return;
    addComment(
      { attachmentId: attachment.$id, comment: text.trim() },
      { onSuccess: () => { setText(""); onClose(); } }
    );
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 bg-background border rounded-xl shadow-2xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Add Comment</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {attachment.fileName}
            </p>
          </div>
          <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={onClose}>
            <XIcon className="size-4" />
          </Button>
        </div>

        <DottedSeparator />

        {/* Textarea */}
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your query or feedback for the member…"
          rows={4}
          className="w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
          }}
        />

        <p className="text-xs text-muted-foreground -mt-2">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Ctrl+Enter</kbd> to send
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || !text.trim()}
          >
            {isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <SendIcon className="size-4 mr-2" />
            )}
            {isPending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Comment list shown below file row (member read-only / admin see their own) ─

interface CommentsViewProps {
  attachmentId: string;
}

function CommentsView({ attachmentId }: CommentsViewProps) {
  const { data, isLoading } = useGetComments({ attachmentId });
  const comments: AttachmentComment[] = data?.documents ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-1 pl-2">
        <Loader2 className="size-3 animate-spin" /> Loading…
      </div>
    );
  }

  if (comments.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-1.5">
      {comments.map((c) => (
        <div
          key={c.$id}
          className="rounded-lg border-l-2 border-primary/40 bg-primary/5 px-3 py-2 text-xs"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-semibold text-primary">{c.authorName}</span>
            <span className="text-muted-foreground shrink-0">
              {formatDate(c.$createdAt)} {formatTime(c.$createdAt)}
            </span>
          </div>
          <p className="text-foreground/80 whitespace-pre-wrap">{c.comment}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export const TaskAttachments = ({ task }: TaskAttachmentsProps) => {
  const workspaceId = useWorkspceId();
  const { data: currentUser } = useCurrent();
  const { data: members } = useGetMembers({ workspaceId });

  const currentMember = members?.documents.find(
    (m) => m.userId === currentUser?.$id
  );

  const isAdmin = currentMember?.role === MemberRole.ADMIN;

// Hide attachment section if admin is viewing their own task
if (isAdmin && task.assigneeId === currentMember?.$id) return null;

const canUpload = Boolean(
  !isAdmin && currentMember && task.assigneeId === currentMember.$id
);

  const { data: attachments, isLoading } = useGetAttachments({
    taskId: task.$id,
  });
  const { mutate: upload, isPending: isUploading } = useUploadAttachment();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteAttachment({
    taskId: task.$id,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Track which attachment's comment dialog is open (null = none)
  const [commentOpenId, setCommentOpenId] = useState<string | null>(null);
  // Track which attachments have their comments section expanded
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const toggleComments = (id: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      upload({ taskId: task.$id, file });
    });
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    const res = await fetch(
      `/api/task-attachments/${attachment.$id}/download`
    );
    if (!res.ok) return;
    const { data } = await res.json();
    const a = document.createElement("a");
    a.href = data.url;
    a.download = data.fileName;
    a.target = "_blank";
    a.click();
  };

  const files = attachments?.documents ?? [];

  return (
    <div className="p-4 border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PaperclipIcon className="size-4 text-muted-foreground" />
          <p className="text-lg font-semibold">
            Attachments
            {files.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({files.length})
              </span>
            )}
          </p>
        </div>

        {canUpload && (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <UploadIcon className="size-4 mr-2" />
              )}
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </>
        )}
      </div>

      <DottedSeparator className="my-4" />

      {/* Drag & Drop zone */}
      {canUpload && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`mb-4 border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground transition-colors ${
            dragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : "border-border hover:border-muted-foreground/50"
          }`}
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Uploading files…
            </span>
          ) : (
            "Drag & drop files here, or click Upload above"
          )}
        </div>
      )}

      {/* File list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
          <Loader2 className="size-4 animate-spin" />
          Loading attachments…
        </div>
      ) : files.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No files attached yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((attachment: TaskAttachment) => {
            const canDelete = canUpload;
            const isCommentsExpanded = expandedComments.has(attachment.$id);

            return (
              <div
                key={attachment.$id}
                className="flex flex-col rounded-lg border bg-muted/40 transition-colors group"
              >
                {/* File row */}
                <div className="flex items-center gap-3 p-3">

                  {/* Icon */}
                  <FileTypeIcon mimeType={attachment.mimeType} />

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(attachment.fileSize)} ·{" "}
                      {formatDate(attachment.$createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Toggle comments (visible to all) */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      title="View comments"
                      onClick={() => toggleComments(attachment.$id)}
                    >
                      {isCommentsExpanded ? (
                        <ChevronUpIcon className="size-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                      )}
                    </Button>

                    {/* Comment button — admin only */}
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-blue-500 hover:text-blue-600"
                        title="Add comment / feedback"
                        onClick={() => setCommentOpenId(attachment.$id)}
                      >
                        <MessageSquareIcon className="size-3.5" />
                      </Button>
                    )}

                    {/* Download — always visible */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      title="Download"
                      onClick={() => handleDownload(attachment)}
                    >
                      <DownloadIcon className="size-3.5" />
                    </Button>

                    {/* Delete — assignee (member) only */}
                    {canDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive hover:text-destructive"
                        title="Delete"
                        disabled={isDeleting}
                        onClick={() => deleteFile(attachment.$id)}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Comments section (expanded) */}
                {isCommentsExpanded && (
                  <div className="px-3 pb-3">
                    <DottedSeparator className="mb-2" />
                    <CommentsView attachmentId={attachment.$id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comment Dialog (portal-style overlay) */}
      {commentOpenId && (
        <CommentDialog
          attachment={files.find((f: TaskAttachment) => f.$id === commentOpenId)!}
          onClose={() => setCommentOpenId(null)}
        />
      )}
    </div>
  );
};

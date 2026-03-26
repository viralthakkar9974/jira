import { Models } from "node-appwrite";

export type TaskAttachment = Models.Document & {
  taskId: string;
  workspaceId: string;
  uploaderId: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

export type AttachmentComment = Models.Document & {
  attachmentId: string;
  workspaceId: string;
  authorId: string;
  authorName: string;
  comment: string;
};

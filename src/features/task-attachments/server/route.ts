import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  TASK_ATTACHMENTS_ID,
  TASKS_ID,
  ATTACHMENT_COMMENTS_ID,
} from "@/config";
import { Task } from "@/features/tasks/types";
import { TaskAttachment, AttachmentComment } from "../types";

const app = new Hono()

  // ── Get download URL (before /:taskId to avoid route conflict) ────────
  .get(
    "/:attachmentId/download",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { attachmentId } = c.req.param();

      const attachment = await databases.getDocument<TaskAttachment>(
        DATABASE_ID,
        TASK_ATTACHMENTS_ID,
        attachmentId
      );

      const member = await getMember({
        databases,
        workspaceId: attachment.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const downloadUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${IMAGES_BUCKET_ID}/files/${attachment.fileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;

      return c.json({ data: { url: downloadUrl, fileName: attachment.fileName } });
    }
  )

  // ── Upload a file for a task ──────────────────────────────────────────
  .post(
    "/:taskId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const storage = c.get("storage");
      const { taskId } = c.req.param();

      const formData = await c.req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return c.json({ error: "No file provided" }, 400);
      }

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Only the task assignee (member) can upload — admin cannot upload
      if (task.assigneeId !== member.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const uploadedFile = await storage.createFile(
        IMAGES_BUCKET_ID,
        ID.unique(),
        file
      );

      const attachment = await databases.createDocument<TaskAttachment>(
        DATABASE_ID,
        TASK_ATTACHMENTS_ID,
        ID.unique(),
        {
          taskId,
          workspaceId: task.workspaceId,
          uploaderId: member.$id,
          fileId: uploadedFile.$id,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
        }
      );

      return c.json({ data: attachment });
    }
  )

  // ── List all attachments for a task ──────────────────────────────────
  .get(
    "/:taskId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId } = c.req.param();

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const attachments = await databases.listDocuments<TaskAttachment>(
        DATABASE_ID,
        TASK_ATTACHMENTS_ID,
        [
          Query.equal("taskId", taskId),
          Query.orderDesc("$createdAt"),
        ]
      );

      return c.json({ data: attachments });
    }
  )

  // ── Delete an attachment ──────────────────────────────────────────────
  .delete(
    "/:attachmentId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const storage = c.get("storage");
      const { attachmentId } = c.req.param();

      const attachment = await databases.getDocument<TaskAttachment>(
        DATABASE_ID,
        TASK_ATTACHMENTS_ID,
        attachmentId
      );

      const member = await getMember({
        databases,
        workspaceId: attachment.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Fetch the task to check if this member is the assignee
      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        attachment.taskId
      );

      // Only the task assignee can delete files (admin cannot delete)
      if (task.assigneeId !== member.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await storage.deleteFile(IMAGES_BUCKET_ID, attachment.fileId);

      await databases.deleteDocument(
        DATABASE_ID,
        TASK_ATTACHMENTS_ID,
        attachmentId
      );

      return c.json({ data: { $id: attachmentId } });
    }
  )

  // ── Add a comment to an attachment (admin only) ───────────────────────
  .post(
    "/:attachmentId/comments",
    sessionMiddleware,
    zValidator("json", z.object({ comment: z.string().min(1).max(5000) })),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { attachmentId } = c.req.param();
      const { comment } = c.req.valid("json");

      const attachment = await databases.getDocument<TaskAttachment>(
        DATABASE_ID,
        TASK_ATTACHMENTS_ID,
        attachmentId
      );

      const member = await getMember({
        databases,
        workspaceId: attachment.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Only admins can post comments
      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Only admins can comment on attachments" }, 403);
      }

      const doc = await databases.createDocument<AttachmentComment>(
        DATABASE_ID,
        ATTACHMENT_COMMENTS_ID,
        ID.unique(),
        {
          attachmentId,
          workspaceId: attachment.workspaceId,
          authorId: member.$id,
          authorName: user.name,
          comment,
        }
      );

      return c.json({ data: doc });
    }
  )

  // ── Get all comments for an attachment (any workspace member) ─────────
  .get(
    "/:attachmentId/comments",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { attachmentId } = c.req.param();

      const attachment = await databases.getDocument<TaskAttachment>(
        DATABASE_ID,
        TASK_ATTACHMENTS_ID,
        attachmentId
      );

      const member = await getMember({
        databases,
        workspaceId: attachment.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const comments = await databases.listDocuments<AttachmentComment>(
        DATABASE_ID,
        ATTACHMENT_COMMENTS_ID,
        [
          Query.equal("attachmentId", attachmentId),
          Query.orderDesc("$createdAt"),
        ]
      );

      return c.json({ data: comments });
    }
  );

export default app;

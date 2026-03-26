import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";

import { DATABASE_ID, WORKSPACES_ID } from "@/config";

import { Workspace } from "../types";
import nodemailer from "nodemailer";

const app = new Hono()
  .post(
    "/:workspaceId/send-invites",
    sessionMiddleware,
    zValidator("json", z.object({
      emails: z.array(z.string().email()).min(1).max(20),
    })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const { emails } = c.req.valid("json");

      // Only admin can send invites
      const member = await getMember({ databases, workspaceId, userId: user.$id });
      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const inviteLink = `${origin}/workspaces/${workspaceId}/join/${workspace.inviteCode}`;

      const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

await Promise.all(
  emails.map((email) =>
    transporter.sendMail({
      from: `"Jira App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `You're invited to join ${workspace.name}`,
      html: `
        <p>Hi,</p>

        <p>You've been invited to join <b>${workspace.name}</b></p>

        <p>
          <a href="${inviteLink}">${inviteLink}</a>
        </p>

        <p>Thanks!</p>
      `,
    })
  )
);

      return c.json({ data: { sent: emails.length } });
    }
  );

export default app;
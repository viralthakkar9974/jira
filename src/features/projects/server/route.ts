import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import {z} from "zod";
import { createProjectSchema } from "../schemas";

const app =new Hono()
  .post(
    "/",
    sessionMiddleware,
    zValidator("form",createProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image,workspaceId } = c.req.valid("form");

      const member= await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({ error: "Unauthorized" }, 401);
      }

      let uploadImageUrl : string | undefined;

      if (image instanceof File) {
        try {
          // Step 1: Upload file to Appwrite storage
          const file = await storage.createFile(
            IMAGES_BUCKET_ID,
            ID.unique(),
            image
          );

          // Step 2: Download file as ArrayBuffer
          const arrayBuffer = await storage.getFileDownload(
            IMAGES_BUCKET_ID,
            file.$id
          );

          // Step 3: Convert ArrayBuffer to base64
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString("base64");

          // Step 4: Get MIME type from file
          const mimeType = image.type || "image/png";

          // Step 5: Create data URL (like in your screenshot)
          uploadImageUrl = `data:${mimeType};base64,${base64}`;

          console.log("Image stored as base64 data URL");

        } catch (error) {
          console.error("Image upload failed:", error);
          uploadImageUrl = "";
        }
      }

      // Create workspace with base64 image data
      const project = await databases.createDocument(
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name,
          imageUrl: uploadImageUrl,
          workspaceId
        }
      );

   

      return c.json({ data: project });
    }
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const user=c.get("user");
      const databases=c.get("databases");
      const { workspaceId }=c.req.valid("query");

      if(!workspaceId){
        return c.json({ error: "workspaceId is required" }, 400);
      }
      
      const memeber=await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!memeber) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const projects=await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.orderDesc("$createdAt"),
        ],
      );

      return c.json({data:projects});
    }
  )



export default app;


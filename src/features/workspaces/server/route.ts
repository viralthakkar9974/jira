import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { Buffer } from "buffer";
import { MemberRole } from "@/features/members/types";
import { generateInvitecode } from "@/lib/utils";

const app = new Hono()
  .get("/",sessionMiddleware,async(c)=>{
    
    const user=c.get("user");
    const databases=c.get("databases");

    const members=await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("userId",user.$id)]
    );

    if(members.total===0){
      return c.json({ data : {documents:[],total:0}});
    }

    const workspacesIds=members.documents.map((member)=>member.workspaceId);


    const workspaces=await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [
        Query.orderDesc("$createdAt"),
        Query.contains("$id",workspacesIds)
      ],
    );

    return c.json({data:workspaces});
  })
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image } = c.req.valid("form");

      let uploadImageUrl = "";

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
      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          imageUrl: uploadImageUrl,
          inviteCode:generateInvitecode(6),
        }
      );

      await databases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),{
          userId:user.$id,
          workspaceId:workspace.$id,
          role:MemberRole.ADMIN,
        },
      );

      return c.json({ data: workspace });
    }
  );

export default app;
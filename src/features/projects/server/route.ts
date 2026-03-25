import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import {z} from "zod";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { Project } from "../types";

import {endOfMonth,startOfMonth,subMonths} from "date-fns";
import { TaskStatus } from "@/features/tasks/types";

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

      if (member.role !== MemberRole.ADMIN) {
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

      const projects=await databases.listDocuments<Project>(
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
  .get(
    "/:projectId",
    sessionMiddleware,
    async (c)=>{
      const user=c.get("user");
      const databases=c.get("databases");
      const {projectId}=c.req.param();

      const project=await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      const member=await getMember({
        databases,
        workspaceId:project.workspaceId,
        userId:user.$id,
      });

      if(!member){
        return c.json({error:"Unauthrized"},401);
      }

      return c.json({data:project});

    } 
  )
  .patch(
      "/:projectId",
      sessionMiddleware,
      zValidator("form",updateProjectSchema),
      async (c)=>{
        const databases=c.get("databases");
        const storage=c.get("storage");
        const user=c.get("user");
  
        const {projectId}=c.req.param();
        const {name,image}=c.req.valid("form");

        const existingProject=await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId
        );
  
        const member=await getMember({
          databases,
          workspaceId: existingProject.workspaceId,
          userId:user.$id,
        });
  
        if(!member){
          return c.json({error:"Unauthorized"},401);
        }
  
        // -----------------------------------------
  
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
  
        else{
          uploadImageUrl=image;
        }
  
        const project=await databases.updateDocument(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,{
            name,
            imageUrl: uploadImageUrl
          }
        );
  
        return c.json({data:project});
      }
    )
  .delete(
        "/:projectId",
        sessionMiddleware,
        async (c)=>{
          const databases=c.get("databases");;
          const user=c.get("user");
          const { projectId }=c.req.param();

          const existingProject=await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId
        );
          
          const member=await getMember({
            databases,
            workspaceId: existingProject.workspaceId,
            userId:user.$id,
          })
    
          if(!member){
            return c.json({error:"Unauthorized"},401);
          }
    
          //todo: delete member
    
          await databases.deleteDocument(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
          );
    
          return c.json({data:{$id:existingProject.$id}});
        }
    )
  .get(
    "/:projectId/analytics",
    sessionMiddleware,
    async(c)=>{
      const databases=c.get("databases");
      const user=c.get("user");
      const {projectId}=c.req.param();

      const project=await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );

      const member=await getMember({
        databases,
        workspaceId:project.workspaceId,
        userId:user.$id,
      });

      if(!member){
        return c.json({error:"Unauthrized"},401);
      }

      const now=new Date();
      const thisMonthStart=startOfMonth(now);
      const thisMonthEnd=endOfMonth(now);
      const lastMonthStart=startOfMonth(subMonths(now,1));
      const lastMonthEnd=endOfMonth(subMonths(now,1));

      const thisMonthTasks=await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId",projectId),
          Query.greaterThanEqual("$createdAt",thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt",thisMonthEnd.toISOString())
        ]
      )

      const lastMonthTasks=await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId",projectId),
          Query.greaterThanEqual("$createdAt",lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt",lastMonthEnd.toISOString())
        ]
      )

      const taskCount=thisMonthTasks.total;
      const taskDifference=taskCount-lastMonthTasks.total;

      const thisMontAssignedTasks=await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId",projectId),
          Query.equal("assigneeId",member.$id),
          Query.greaterThanEqual("$createdAt",thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt",thisMonthEnd.toISOString())
        ]
      )

      const lastMontAssignedTasks=await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId",projectId),
          Query.equal("assigneeId",member.$id),
          Query.greaterThanEqual("$createdAt",lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt",lastMonthEnd.toISOString())
        ]
      )

      const assignedTaskCount=thisMontAssignedTasks.total;
      const assignedTaskDifference=assignedTaskCount-lastMontAssignedTasks.total;

      const thisMontIncompleteTasks=await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId",projectId),
          Query.notEqual("status",TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt",thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt",thisMonthEnd.toISOString())
        ]
      )

      const lastMontIncompleteTasks=await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId",projectId),
          Query.notEqual("status",TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt",lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt",lastMonthEnd.toISOString())
        ]
      )

      const incompleteTaskCount=thisMontIncompleteTasks.total;
      const incompleteTaskDifference=incompleteTaskCount-lastMontIncompleteTasks.total;



      const thisMonthCompletedTasks=await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId",projectId),
          Query.equal("status",TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt",thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt",thisMonthEnd.toISOString())
        ]
      )

      const lastMonthCompletedTasks=await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId",projectId),
          Query.equal("status",TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt",lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt",lastMonthEnd.toISOString())
        ]
      )

      const CompletedTaskCount=thisMonthCompletedTasks.total;
      const CompletedTaskDifference=CompletedTaskCount-lastMonthCompletedTasks.total;




      const thisMonthOverdueTasks=await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId",projectId),
          Query.notEqual("status",TaskStatus.DONE),
          Query.lessThan("dueDate",now.toISOString()),
          Query.greaterThanEqual("$createdAt",thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt",thisMonthEnd.toISOString())
        ]
      )

      const lastMonthOverdueTasks=await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId",projectId),
          Query.notEqual("status",TaskStatus.DONE),
          Query.lessThan("dueDate",now.toISOString()),
          Query.greaterThanEqual("$createdAt",lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt",lastMonthEnd.toISOString())
        ]
      )

      const OverdueTaskCount=thisMonthOverdueTasks.total;
      const OverdueTaskDifference=OverdueTaskCount-lastMonthOverdueTasks.total;

      return c.json({
        data:{
          taskCount,
          taskDifference,
          assignedTaskCount,
          assignedTaskDifference,
          CompletedTaskCount,
          CompletedTaskDifference,
          incompleteTaskCount,
          incompleteTaskDifference,
          OverdueTaskCount,
          OverdueTaskDifference,
        }
      });
    
    }
  )
  



export default app;


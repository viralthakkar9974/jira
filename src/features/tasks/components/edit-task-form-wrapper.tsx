import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { useGetTask } from "../api/use-get-task";
import { EditTaskForm } from "./edit-task-form";
import { useCurrent } from "@/features/auth/api/use-current";
import { MemberRole } from "@/features/members/types";
import { useEffect } from "react";

interface EditTaskFormWrapperProps {
  onCancel:()=>void;
  id:string;
};

export const EditTaskFormWrapper=({
  onCancel,
  id
}:EditTaskFormWrapperProps)=>{


  const workspaceId=useWorkspceId();

  const {data:initialValues,isLoading:isLoadingTask}=useGetTask({
    taskId:id,
  })

  const {data:projects,isLoading:isLoadingProject}=useGetProjects({workspaceId});
  const {data:members,isLoading:isLoadingMembers}=useGetMembers({workspaceId});
  const {data:currentUser,isLoading:isLoadingCurrentUser}=useCurrent();

  const currentMember=members?.documents.find((m)=>m.userId===currentUser?.$id);
  const canEdit = Boolean(
    currentMember?.role===MemberRole.ADMIN ||
    (currentMember && initialValues?.assigneeId===currentMember.$id)
  );

  const projectOptions=projects?.documents.map((project)=>({
    id:project.$id,
    name:project.name,
    imageUrl:project.imageUrl,
  }));

  const memberOptions=members?.documents.map((project)=>({
    id:project.$id,
    name:project.name,
  }));

  const isLoading = isLoadingProject || isLoadingMembers || isLoadingTask || isLoadingCurrentUser;

  useEffect(()=>{
    if(!isLoading && initialValues && !canEdit){
      onCancel();
    }
  },[isLoading,initialValues,canEdit,onCancel]);

  if(isLoading){
    return(
      <Card className="w-full h-[714px] border-none shadow-none" >
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground " />
        </CardContent>
      </Card>
    )
  }

  if(!initialValues){
    return null;
  }

  if(!canEdit){
    return null;
  }

  return(
    <div>
     <EditTaskForm
      onCancel={onCancel}
      initialValues={initialValues}
      projectOptions={projectOptions ?? []}
      memberOptions={memberOptions ?? [] }
     />
      
    </div>
  )



}


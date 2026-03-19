"use client";

import { Analytics } from "@/components/analytics";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetMembers } from "@/features/members/api/use-get-members";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";

import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-project-workspace";
import { useWorkspceId } from "@/features/workspaces/hooks/use-workspace-id";

export const WorkspaceIdClient =()=>{

  const workspaceId=useWorkspceId();

  const {data:analytics, isLoading:isLoadingAnalytics}=useGetWorkspaceAnalytics({workspaceId});
  const {data:tasks, isLoading:isLoadingTasks}=useGetTasks({workspaceId});
 const {data:projects, isLoading:isLoadingProjects} = useGetProjects({workspaceId});

  const {data:members, isLoading:isLoadingMembers}=useGetMembers({workspaceId});

  const {open:createProject}=useCreateProjectModal();
  const {open:createTask}=useCreateTaskModal();

  const isLoading=
    isLoadingAnalytics ||
    isLoadingTasks ||
    isLoadingProjects ||
    isLoadingMembers;

    if(isLoading){
      return <PageLoader />
    }

    if(!analytics || !tasks || !projects || !members){
      return <PageError message="Faild to load workspace data" />
    }

  return (
    <div className="h-full flex flex-col space-y-4">
        <Analytics data={analytics} />
    </div>
  )
}
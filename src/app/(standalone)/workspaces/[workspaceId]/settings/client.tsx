"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useWorkspceId } from "@/features/workspaces/hooks/use-workspace-id";

export const WorkspaceIdSettingClient=()=>{
  const workspaceId=useWorkspceId();
    const {data:initialValues,isLoading}=useGetWorkspace({workspaceId});
  
    if(isLoading){
      return <PageLoader />
    }
  
    if(!initialValues){
       return <PageError message="workspace not Found" />
     }

  return(
    <div className="w-full lg:max-w-xl">
          <EditWorkspaceForm initialValues={initialValues}/>
    </div>
  )
}
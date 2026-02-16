import { getCurrent } from "@/features/auth/action";
import { getWorkspace } from "@/features/workspaces/action";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { redirect } from "next/navigation";

interface WorkspaceIdSettingPageProps{
  params:{
    workspaceId:string;
  };
};


const WorkspaceIdSettingPage= async ({
  params,
}:WorkspaceIdSettingPageProps)=>{
  

  const user=await getCurrent();
  if(!user) redirect("/sign-in"); 

  const initialValues=await getWorkspace({
    workspaceId:params.workspaceId
  });

  if(!initialValues){
    redirect(`/workspaces/${params.workspaceId}`);
  }

  return (
    <div>
      <EditWorkspaceForm initalValues={initialValues}/>
    </div>
  );
}

export default WorkspaceIdSettingPage;
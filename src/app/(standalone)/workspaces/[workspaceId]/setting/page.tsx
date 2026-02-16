import { getCurrent } from "@/features/auth/action";
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

  return (
    <div>
    WorkspaceIdSettingPage:{params.workspaceId}
    </div>
  );
}

export default WorkspaceIdSettingPage;
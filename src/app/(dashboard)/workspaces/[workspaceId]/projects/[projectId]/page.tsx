import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { ProjectIdClient } from "./client";



const ProjectIdPage = async () => {
  const user=await getCurrent();
  if(!user){
    return redirect("/sign-in");
  }


  return <ProjectIdClient />
}

export default ProjectIdPage;
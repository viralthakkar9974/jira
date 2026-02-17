import {useParams} from "next/navigation";

export const useWorkspceId=()=>{
  const params=useParams();
  return params.workspaceId as string;
};
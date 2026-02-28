import {useQuery} from "@tanstack/react-query";

import {client} from "@/lib/rpc";
import { TaskStatus } from "../types";
import { Search } from "lucide-react";

interface UseGetProjectProps{
  workspaceId:string;
  projectId?:string | null;
  status?:TaskStatus | null;
  search?:string | null;
  assigneeId?:string | null;
  dueDate?:string | null;
};


export const useGetTask=({
  workspaceId,
  projectId,
  search,
  status,
  assigneeId,
  dueDate,
}:UseGetProjectProps)=>{
  const query=useQuery({
    queryKey : [
      "tasks",
      workspaceId,
      projectId,
      Search,
      status,
      assigneeId,
      dueDate,
    ],
    queryFn : async()=>{
      const response=await client.api.tasks.$get({
        query:{
          workspaceId,
          projectId:projectId ?? undefined,
          status:status ?? undefined,
          search:search ?? undefined,
          assigneeId:assigneeId ?? undefined,
          dueDate:dueDate ?? undefined,
        },
      });

      if(!response.ok){
        throw new Error("failed to fetch projects");
      }

      const {data}=await response.json();
      return data;
    }
  });
  return query;
}
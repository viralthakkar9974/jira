import {useQuery} from "@tanstack/react-query";

import {client} from "@/lib/rpc";


interface UseGetTaskProps{
  taskId:string;
};


export const useGetTask=({
  taskId
}:UseGetTaskProps)=>{
  const query=useQuery({
    queryKey : ["tasks",taskId],
    queryFn : async()=>{
      const response=await client.api.tasks[":taskId"].$get({param:{
        taskId,
      }});

      if(!response.ok){
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any)?.error || "failed to fetch task");
      }

      const {data}=await response.json();
      return data;
    }
  });
  return query;
}
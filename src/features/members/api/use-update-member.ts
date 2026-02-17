import { toast } from "sonner";

import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

import { useQueryClient } from "@tanstack/react-query";



type ResponseType =InferResponseType<typeof client.api.members[":memberId"]["$patch"],200>;
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$patch"]>;

export const useUpdateMember=()=>{

  const queryClient=useQueryClient();
  
  const mutation=useMutation<
  ResponseType,
  Error,
  RequestType
  >({
    mutationFn : async({ param , json})=>{
      const response=await client.api.members[":memberId"]["$patch"]({param,json});
      
      if(!response.ok){
        throw new Error("Faild to update member");
      }

      return await response.json();
    },
    onSuccess:()=>{
      toast.success("Member update")
      queryClient.invalidateQueries({queryKey:["members"]});
    },
    onError:()=>{
      toast.error("Faild to update member")
    }
  })
  return mutation;
}
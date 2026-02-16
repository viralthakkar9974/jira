import { toast } from "sonner";

import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";



type ResponseType =InferResponseType<typeof client.api.auth.login["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>;

export const useLogin=()=>{

  const router=useRouter();
  const queryClient=useQueryClient();
  
  const mutation=useMutation<
  ResponseType,
  Error,
  RequestType
  >({
    mutationFn : async({json})=>{
      const response=await client.api.auth.login["$post"]({ json});
      
      if(!response.ok){
        throw new Error("Faild to Login")
      }
      
      return await response.json();
    },
    onSuccess:()=>{
      toast.success("Logged in")
      router.refresh();
      queryClient.invalidateQueries({queryKey:["current"]});
    },
    onError:()=>{
      toast.error("Faild to Login in ")
    }
  })
  return mutation;
}
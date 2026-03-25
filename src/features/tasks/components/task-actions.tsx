import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

import {useDeleteTask} from "../api/use-delete-task";
import { useConfirm } from "@/hooks/use-confirm";

import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberRole } from "@/features/members/types";

interface TaskActionProps{
  id:string;
  projectId:string;
  assigneeId:string;
  children:React.ReactNode;
};

export const TaskActions=({id,projectId,assigneeId,children}:TaskActionProps)=>{
  const workspaceId=useWorkspceId();
  const router=useRouter();

  const {open}=useEditTaskModal();

  const {data:currentUser}=useCurrent();
  const {data:members}=useGetMembers({workspaceId});
  const currentMember=members?.documents.find((m)=>m.userId===currentUser?.$id);

  const canEdit = Boolean(
    currentMember?.role===MemberRole.ADMIN ||
    (currentMember && assigneeId===currentMember.$id)
  );

  const [ConfirmDialog,confirm]=useConfirm(
    "Delete Task",
    "This action cannot be undone",
    "destructive"
  );

  const {mutate,isPending}=useDeleteTask();

  const onDelete=async()=>{
    const ok =await confirm();
    if(!ok) return;

    mutate({param:{taskId:id}});
  }

  const onOpenTask=()=>{
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  }

  const onOpenProject=()=>{
    router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
  }

return(
  <div className="felx justify-end">
    <ConfirmDialog />
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
        onClick={onOpenTask}
        
        className="font-medium p-[10px]"
        >
          <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
          Task Details
        </DropdownMenuItem>

        <DropdownMenuItem
        onClick={onOpenProject}
        className="font-medium p-[10px]"
        >
          <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
          Open Project
        </DropdownMenuItem>

        {canEdit && (
          <>
            <DropdownMenuItem
              onClick={()=>open(id)}
              className="font-medium p-[10px]"
            >
              <PencilIcon className="size-4 mr-2 stroke-2" />
              Edit Task
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onDelete}
              disabled={isPending}
              className="text-amber-700 focus:text-amber-700 font-medium p-[10px]"
            >
              <TrashIcon className="size-4 mr-2 stroke-2" />
              Delete Task
            </DropdownMenuItem>
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)
}


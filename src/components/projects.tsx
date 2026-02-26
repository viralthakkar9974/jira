"use client";

import {RiAddCircleFill} from "react-icons/ri"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import path from "path";
import Link from "next/link";
import { use } from "react";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";


export const Projects = ()=>{
  const projectId=null;
  const pathname=usePathname();
  const {open}=useCreateProjectModal();
  const workspaceId=useWorkspceId();
  const {data}=useGetProjects({
    workspaceId,
  });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">
          Proejcts
        </p>
        <RiAddCircleFill onClick={() => { }} className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
      </div>
      {data?.documents.map((project)=>{
        const href=`/workspaces/${workspaceId}/projects/${projectId}`;
        const isActive=pathname === href;
        
        return (
          <Link href={href} key={project.$id}>
            <div
            className={cn(
              "flex items-center gap-2.5 rounded-md hover:opacity-75 transition cursor-pointer",
              isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
            )}
            >
              <ProjectAvatar name={project.name} image={project.imageUrl}/>
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        )
      })}
    </div>
  );
}
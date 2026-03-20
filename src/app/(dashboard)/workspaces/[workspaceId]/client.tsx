"use client";

import { Analytics } from "@/components/analytics";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { useGetMembers } from "@/features/members/api/use-get-members";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";

import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { Task } from "@/features/tasks/types";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-project-workspace";
import { useWorkspceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PlusIcon,CalendarIcon,SettingsIcon } from "lucide-react";
import Link from "next/link";
import {formatDistanceToNow} from "date-fns"; 
import { Card,CardContent } from "@/components/ui/card";
import { Project } from "@/features/projects/types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Member } from "@/features/members/types";
import { MemberAvatar } from "@/features/members/components/members-avatar";


export const WorkspaceIdClient =()=>{

  const workspaceId=useWorkspceId();

  const {data:analytics, isLoading:isLoadingAnalytics}=useGetWorkspaceAnalytics({workspaceId});
  const {data:tasks, isLoading:isLoadingTasks}=useGetTasks({workspaceId});
 const {data:projects, isLoading:isLoadingProjects} = useGetProjects({workspaceId});

  const {data:members, isLoading:isLoadingMembers}=useGetMembers({workspaceId});

  

  const isLoading=
    isLoadingAnalytics ||
    isLoadingTasks ||
    isLoadingProjects ||
    isLoadingMembers;

    if(isLoading){
      return <PageLoader />
    }

    if(!analytics || !tasks || !projects || !members){
      return <PageError message="Faild to load workspace data" />
    }

  return (
    <div className="h-full flex flex-col space-y-4">
        <Analytics data={analytics} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <TaskList data={tasks.documents} total={tasks.total} />
          <ProjectList data={projects.documents} total={projects.total} />
          <MembersList data={members.documents} total={members.total} />
        </div>
    </div>
  )
}

interface TaskListProps{
  data:Task[];
  total:number;
}

export const TaskList =({data,total}:TaskListProps)=>{

   const {open:createTask}=useCreateTaskModal();
   const workspaceId=useWorkspceId();


  return(
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4 ">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">
            Tasks({total})
          </p>
          <Button variant="muted" size="icon" onClick={createTask} >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4"/>
        <ul className="flex flex-col gap-y-4">
          {data.map((task)=>(
            <li key={task.$id}>
              <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition-none">
                  <CardContent className="p-4">
                    <p className="text-lg font-medium truncate ">{task.name}</p>
                    <div className="flex items-center gap-x-2">
                      <p>{task.project?.name}</p>
                      <div className="size-1 rounded-full bg-neutral-300" />
                      <div className="text-sm text-muted-foreground flex items-center ">
                        <CalendarIcon className="size-3 mr-1" />
                        <span className=" truncate ">
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No Task Found
          </li>
        </ul>
        <Button variant="muted" className="mt-4 w-full" asChild>
          <Link href={ `/workspaces/${workspaceId}/tasks` }>
          Show All
          </Link>
        </Button>
      </div>
    </div>
  )
}

interface ProjectListProps{
  data:Project[];
  total:number;
}

export const ProjectList =({data,total}:ProjectListProps)=>{

   const workspaceId=useWorkspceId();
   const {open:createProject}=useCreateProjectModal();


  return(
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4 ">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">
            Projects({total})
          </p>
          <Button variant="secondary" size="icon" onClick={createProject} >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4"/>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((project)=>(
            <li key={project.$id}>
              <Link href={`/workspaces/${workspaceId}/tasks/${project.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition-none">
                  <CardContent className="p-4 flex items-center gap-x-2.5">
                    <ProjectAvatar
                      className="size-12"
                      fallbackClassName="text-lg"
                      image={project.imageUrl}
                      name={project.name}
                    />
                    <p className="text-lg font-medium truncate">
                      {project.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No Project Found
          </li>
        </ul>
      </div>
    </div>
  )
}



interface MembersListProps{
  data:Member[];
  total:number;
}

export const MembersList =({data,total}:MembersListProps)=>{

   const workspaceId=useWorkspceId();


  return(
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4 ">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">
            Members({total})
          </p>
          <Button variant="secondary" size="icon" asChild >
            <Link href={`/workspaces/${workspaceId}/members`}>
              <SettingsIcon className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4"/>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((member)=>( 
            <li key={member.$id}>
              
                <Card className="shadow-none rounded-lg overflow-hidden ">
                  <CardContent className="p-3 flex flex-col items-center gap-x-2">
                    <MemberAvatar
                      className="size-12"
                      name={member.name}
                    />
                    <div className="flex flex-col items-center overflow-hidden ">
                      <p className="text-lg font-medium line-clamp-1">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {member.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No Members Found
          </li>
        </ul>
      </div>
    </div>
  )
}
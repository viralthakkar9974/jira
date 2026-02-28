"use client"

import {z} from "zod";
import { useRef } from "react";

import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createTaskSchema } from "../schemas";

import {Button} from "@/components/ui/button"

import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { AvatarFallback, Avatar } from "@/components/ui/avatar";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import{
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "../api/use-create-task";
import { Divide, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { TaskStatus } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";


interface CreateTaskFormProps{
  onCancel?:()=>void;
 projectOptions:{id:string,name:string,imageUrl:string}[];
 memberOptions:{id:string,name:string}[]

};

export const CreateTaskForm=({onCancel,projectOptions,memberOptions}:CreateTaskFormProps)=>{

  const workspaceId=useWorkspceId();
  const router=useRouter();

  const {mutate,isPending}=useCreateTask();
  
  const inputRef=useRef<HTMLInputElement>(null);

  const formSchema = createTaskSchema.omit({ workspaceId: true });

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    workspaceId,
  },
});

  const handleImageChange=(e: React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(file){
      form.setValue("image",file);
    }
  }

 const onSubmit = (values: z.infer<typeof formSchema>) => {
  
  mutate({ json: {...values,workspaceId} }, {
    onSuccess: ({ data }) => {
      form.reset();
      // todo Redirect to new task
    }
  });
};
  return(
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new Task
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator/> 
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Task Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter task name"
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Task Due Date
                  </FormLabel>
                  <FormControl>
                    <DatePicker {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigneeId"
              render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Task Assignee
                  </FormLabel>
                  <FormControl>
                    <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage/>
                      <SelectContent>
                        {
                          memberOptions.map((member)=>(
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-x-2">
                                <MemberAvatar
                                  className="size-6"
                                  name={member.name}
                                />
                                {member.name}
                              </div>
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            
            {/* FIX 1: name was "assigneeId", changed to "status" */}
            <FormField
              control={form.control}
              name="status"
              render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Status
                  </FormLabel>
                  <FormControl>
                    <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage/>
                      <SelectContent>
                        <SelectItem value={TaskStatus.BACKLOG}>
                          Backlog
                        </SelectItem>
                        <SelectItem value={TaskStatus.TODO}>
                          ToDo
                        </SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>
                          In Progress
                        </SelectItem>
                        <SelectItem value={TaskStatus.DONE}>
                          Done
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectId"
              render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Project
                  </FormLabel>
                  <FormControl>
                    <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage/>
                      <SelectContent>
                        {
                          /* FIX 2: was memberOptions, changed to projectOptions */
                          projectOptions.map((project)=>(
                            <SelectItem key={project.id} value={project.id}>
                              <div className="flex items-center gap-x-2">
                                <ProjectAvatar
                                  className="size-6"
                                  name={project.name}
                                  image={project.imageUrl}
                                />
                                {project.name}
                              </div>
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            </div>
            <DottedSeparator className="py-7"/>
            <div className="flex items-center justify-between">
              <Button
              type="submit"
              size="lg"
              variant="secondary"
              onClick={onCancel}
              disabled={isPending}
              className={cn(!onCancel && "invisible")}
              >
                Cancel
              </Button>
              <Button
              type="submit"
              size="lg"
              disabled={isPending}
              >
                Create Task
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )

};
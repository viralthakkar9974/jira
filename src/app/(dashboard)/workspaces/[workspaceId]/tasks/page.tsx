import {redirect} from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { getMember } from "@/features/members/utils";
import { createSessionClient } from "@/lib/appwrite";
import { DATABASE_ID } from "@/config";

interface TaskPageProps {
  params: { workspaceId: string };
}

const TaskPage = async ({ params }: TaskPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const { databases } = await createSessionClient();
  const member = await getMember({
    databases,
    workspaceId: params.workspaceId,
    userId: user.$id,
  });

  if (!member) redirect("/");

  return <TaskViewSwitcher hideProjectFilter={false} assigneeIdOverride={member.$id} />;
};

export default TaskPage;
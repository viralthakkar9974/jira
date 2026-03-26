import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { getMember } from "@/features/members/utils";
import { createSessionClient } from "@/lib/appwrite";
import { MemberRole } from "@/features/members/types";
import { InviteClient } from "./client";

interface Props {
  params: { workspaceId: string };
}

const InvitePage = async ({ params }: Props) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const { databases } = await createSessionClient();
  const member = await getMember({
    databases,
    workspaceId: params.workspaceId,
    userId: user.$id,
  });

  if (!member || member.role !== MemberRole.ADMIN) {
    redirect(`/workspaces/${params.workspaceId}`);
  }

  return <InviteClient />;
};

export default InvitePage;
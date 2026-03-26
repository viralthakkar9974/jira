"use client";

import { SettingsIcon, UsersIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import {GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill} from "react-icons/go";
import { cn } from "@/lib/utils";

import { useWorkspceId } from "@/features/workspaces/hooks/use-workspace-id";
import { usePathname } from "next/navigation";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberRole } from "@/features/members/types";


const routes=[
  {
    label: "Home",
    href:"",
    icon: GoHome,
    activeIcon:GoHomeFill,
  },
  {
    label: "My Tasks",
    href:"/tasks",
    icon: GoCheckCircle,
    activeIcon:GoCheckCircleFill,
  },
  {
    label: "Settings",
    href:"/settings",
    icon: SettingsIcon,
    activeIcon:SettingsIcon,
  },

  {
    label: "Members",
    href:"/members",
    icon: UsersIcon,
    activeIcon:UsersIcon,
  },
  {
    label: "Invite Link",
    href:"/invite",
    icon: MailIcon,
    activeIcon: MailIcon,
  },
];

export const Navigation=()=>{
  const workspaceId=useWorkspceId();
  const pathname=usePathname();
  
  const { data: currentUser } = useCurrent();
  const { data: members } = useGetMembers({ workspaceId });
  
  const currentMember = members?.documents?.find(
    (m: { userId: string; role: string }) => m.userId === currentUser?.$id
  );
  const isAdmin = currentMember?.role === MemberRole.ADMIN;

  return(
    <ul className="flex flex-col">
      {routes.map((item)=>{
        const fullHref=`/workspaces/${workspaceId}${item.href}`
        const isActive=pathname===fullHref;
        const Icon=isActive ? item.activeIcon : item.icon ;
        
        if(item.label === "Invite Link" && !isAdmin) return null;
        return(
          <Link key={item.href} href={fullHref}>
            <div className={cn(
              "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
              isActive && "bg-white shdow-sm hover:opacity-100 text-primary"
            )
            }>
              <Icon className="size-5 text-neutral-500"/>
                {item.label}
            </div>
          </Link>
        )
      })}
    </ul>
  )
}

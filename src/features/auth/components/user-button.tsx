"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Loader, LogOut } from "lucide-react";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@radix-ui/react-dropdown-menu";

import { useLogout } from "../api/use-logout";
import { useCurrent } from "../api/use-current";
;
import { DottedSeparator } from "@/components/dotted-separator";

export const UserButton = () => {
  const { data: user, isLoading } = useCurrent();
  const { mutate: logout } = useLogout();

  if (isLoading) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { name, email } = user;

  const avatarFallback = name
    ? name.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase() ?? "U";


  return (
    <DropdownMenu modal={false}>
      {/* ✅ Use asChild so Radix does not wrap Avatar */}
      <DropdownMenuTrigger asChild>
        <div className="size-10 rounded-full border border-neutral-300 p-[1px] hover:border-neutral-400 transition cursor-pointer">
          <Avatar className="size-full">
            <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="bottom" sideOffset={10} className="w-60 bg-white shadow-lg rounded-md border">
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <div className="size-10 rounded-full border border-neutral-300 p-[1px]">
            <Avatar className="size-full">
              <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </div>

          <p className="text-sm font-medium">{name || "User"}</p>
          <p className="text-xs text-neutral-500">{email}</p>
        </div>
        <DottedSeparator className="mb-1"/>
        <DropdownMenuItem 
        className="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer"
        onClick={() => logout()}
        
        >
          <LogOut className="size-4 mr-2"/>
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  );
};


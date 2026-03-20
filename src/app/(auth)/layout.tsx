"use client";


import Link from "next/link";
import { Button } from "@/components/ui/button"

import { usePathname } from "next/navigation";
import Image from "next/image";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const pathname = usePathname();  
  const isSignIn = pathname === "/sign-in";

  return (
        <main className="bg-neutral-100 min-h-screen">
            <div className="max-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center">
                    <Image src="/a.webp" alt="logo"  width={152} height={56} />
                    <Button asChild variant="secondary">
                      <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
                        {isSignIn ? "Sign up" : "Login"}
                      </Link>
                    </Button>
                </nav>
                <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
                        {children}    
                </div>
            </div>
        </main>
    );
};

export default AuthLayout;
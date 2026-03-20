"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import  Link  from "next/link";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
}
  from "@/components/ui/form";
  
import { loginSchema } from "../schema";
import { useLogin } from "../api/use-login";



export const SignInCard = () => {

  const { mutate,isPending }=useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    mutate({json: values});
  };

  
  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">
          Welcome back
        </CardTitle>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter email address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />



            <Button disabled={isPending} size="lg" className="w-full">
              Login
            </Button>


          </form>
        </Form>
      </CardContent>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-3">
        <Button
          onClick={()=>signUpWithGoogle()}
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={isPending}

        >
          <FcGoogle className="mr-2 size-5" />
          login with Google
        </Button>
      </CardContent>

      <CardContent className="p-2">
        <Button
          onClick={()=>signUpWithGithub()}
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          <FaGithub className="mr-2 size-5" />
          login with Github
        </Button>
      </CardContent>

      <div className="px-7">
        <DottedSeparator /> 
      </div>

      <CardContent className="p-7 flex items-center justify-center">
        <p>
              don&apos;t have an account? 
              <Link href="/sign-up" className="text-blue-500 ml-1">
                Sign up
              </Link>
        </p>
      </CardContent>

    </Card>
  );
};

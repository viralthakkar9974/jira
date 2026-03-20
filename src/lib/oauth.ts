"use server";

import { createAdminClient } from "@/lib/appwrite";
import { redirect } from "next/navigation";
import { OAuthProvider } from "node-appwrite";

 export async function signUpWithGithub() {
  const { account } = await createAdminClient();

  const redirectUrl = await account.createOAuth2Token(
    OAuthProvider.Github,
    `http://localhost:3000/oauth`,
    `http://localhost:3000/sign-in`,
  );

  return redirect(redirectUrl);
}


export async function signUpWithGoogle() {
  const { account } = await createAdminClient();

  const redirectUrl = await account.createOAuth2Token(
    OAuthProvider.Google,
    `${process.env.NEXT_PUBLIC_API_URL}`,
    `${process.env.NEXT_PUBLIC_API_URL}`,
  );

  return redirect(redirectUrl);
}
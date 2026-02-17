

import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { SignUpCard } from "@/features/auth/components/sign-up-card";

const signupPage = async () => {

    
    const user= await getCurrent();
    
    if(user) redirect("/");
    
    return (
        <div>
            <SignUpCard />
        </div>
    )   
}

export default signupPage;
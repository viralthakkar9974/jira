"use client";

import { Loader } from "lucide-react";


const LoadingPage=()=>{
  return(
    <div className="h-screen flex flex-col items-center justify-center">
      <Loader className="animate-spin size-6 text-muted-foreground"/>
    </div>
  );
}


export default LoadingPage;

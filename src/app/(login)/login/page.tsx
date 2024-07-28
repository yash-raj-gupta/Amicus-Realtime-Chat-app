'use client'
import Button from "@/components/ui/Button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { FunctionComponent, useState } from "react";
import toast from "react-hot-toast";


 
const Page: FunctionComponent = () => {

    async function loginWithGoogle () {
        setIsLoading(true)

        try {
            
            await signIn('github');
        } catch (error) {
            toast.error('Failed to sign in');
        }finally{
            setIsLoading(false)
        
        }

    }

    const [isLoading, setIsLoading] = useState<boolean>(false)
    return (
       <>
       <div className="flex justify-center items-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col w-full max-w-md items-center space-y-8">
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-row space-x-3 items-center -mb-4">
              <Image
                   src={'./logo.svg'}
                   alt="logo"
                   width={120}
                   height={120}
                   className="w-12 h-12 sm:w-10 sm:h-10 mr-3 "
        />
                <h1 className="text-4xl font-bold">Amicus</h1>
              </div>
              <p className="text-gray-500 leading-6">An app where all friends chat but privately</p>

                <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">Sign In to your account</h2>
            </div>
            <Button
            isLoading={isLoading}
            type="button"
            className="max-w-sm mx-auto w-full items-center justify-center text-lg"
            onClick={loginWithGoogle}
            >
                {isLoading ? null : (
                <Image src="./github.svg" alt="github logo" width={20} height={20} className="w-5 h-5 mr-2"/>
)}
           Github
            </Button>

           </div>
       </div>
       </>


      );
}
 
export default Page;
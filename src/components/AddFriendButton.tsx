"use client"
import { FunctionComponent, useState} from "react";
import Button from "./ui/Button";
import { addFriendValidator } from "@/lib/validation/add-friend";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
interface AddFriendButtonProps {
    
}
    type FormData = z.infer<typeof addFriendValidator>;
const AddFriendButton: FunctionComponent<AddFriendButtonProps> = () => {

    const [showSuccessState, setShowSuccessState] = useState<boolean>(false)

    const { register, handleSubmit, setError, formState: {errors} } = useForm<FormData>({
        resolver: zodResolver(addFriendValidator)
    })

    const onSubmit = (data: FormData) => {
        addFriend(data.email)
    }

    const addFriend = async (email: string) => {
        try {
            const validatedEmail = addFriendValidator.parse({email})
             console.log(validatedEmail)
            await axios.post('/api/friends/add', {
                email: validatedEmail
            })

            setShowSuccessState(true)
        } catch (error) {
            if(error instanceof z.ZodError){
                setError('email', {message: error.message})
                return
            }

            if(error instanceof AxiosError){
                setError('email', {message: error.response?.data})
                return
            }

            setError('email', {message: 'Something went wrong'})
        }
    }
    return ( 
        <form className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Add friend by email
            </label>
            <div className="flex mt-2 gap-4">
                <input {...register('email')} type="text" className="w-full rounded-md block border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2  focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="you@example.com"
                />
                <Button>Add</Button>
            </div>
            <p className="mt-1 text-red-600 text-sm">{errors.email?.message}</p>
            {showSuccessState &&  <p className="mt-1 text-green-600 text-sm">Friend Request sent</p>}
        </form>
     );
}
 
export default AddFriendButton;
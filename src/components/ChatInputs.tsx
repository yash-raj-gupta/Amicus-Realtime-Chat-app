'use client'
import  TextareaAutosize  from "react-textarea-autosize";
import { FunctionComponent, useRef, useState } from "react";
import { set } from "zod";
import Button from "./ui/Button";
import axios from "axios";
import toast from "react-hot-toast";
interface ChatInputsProps {
    chatPartner: User,
    chatId: string
}
 
const ChatInputs: FunctionComponent<ChatInputsProps> = ({chatPartner, chatId}) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [input, setInput] = useState<string>('')

    const [isLoading, setIsLoading] = useState<boolean>(false)


    const sendMessage = async () => {
        if(!input) return 
        setIsLoading(true)

        try {
            await axios.post('/api/message/send', {text: input, chatId} )
            setInput('')
            textareaRef.current?.focus()
            return new Response ('ok', {status: 200})
        } catch (error) {
            toast.error('Something went wrong. Please try again later')
        }finally{
            setIsLoading(false);;
        }

    }


    return ( 
        <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
            <div className="flex-1 overflow-hidden rounded-lg shadow-sm relative ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                <TextareaAutosize ref={textareaRef} onKeyDown={(e) => {
                    if(e.key === 'Enter ' && !e.shiftKey ){
                        e.preventDefault();
                        sendMessage();
                    }
                }}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${chatPartner.name}`}
                className="block w-full resize-none text-gray-900 border-0 bg-transparent placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:leading-6"
                />
                <div className="py-2" aria-hidden='true' onClick={() => textareaRef.current?.focus}>
                    <div className="py-px">
                      <div className="h-9"/>
                    </div>
                </div>
                <div className="flex justify-between bottom-0 right-0 absolute py-2 pl-3 pr-2">
                    <div className="flex-shrink-0">
                        <Button isLoading={isLoading} type="submit" onClick={sendMessage}>Post</Button>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default ChatInputs;
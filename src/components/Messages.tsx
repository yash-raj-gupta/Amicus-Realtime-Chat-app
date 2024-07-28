'use client'

import { cn } from "@/lib/utils";
import { Message } from "@/lib/validation/message";
import { FunctionComponent, useRef, useState, useEffect } from "react";
import {format} from 'date-fns'
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";


interface MessagesProps {
    initialMessages: Message[],
    sessionId: string,
    sessionImg: string | null | undefined,
    chatPartner: User,
    chatId: string
}
 
const Messages: FunctionComponent<MessagesProps> = ({
    initialMessages, sessionId, sessionImg, chatPartner, chatId
}) => {

    const [messages, setMessages] = useState<Message[]>(initialMessages)
    
    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    const formatTimestamp =  (timestamp:number) => {
      return format(timestamp, 'HH:mm')
    }

    //going to subscribe to any friend requests changes ae done in the server
    // we are using the function toPusherKey because pusher invalidates : in the links
    useEffect(()=> {
      pusherClient.subscribe(toPusherKey(`chat:${chatId}`))

      const messageHandler = (message: Message) => {
        setMessages((prev)=> [message, ...prev])
      }
// binding tells pusher what to do
      pusherClient.bind('incoming-message', messageHandler)

      return () => {
        pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`))
        pusherClient.unbind('incoming-message', messageHandler)

      }
    },[chatId])
    


    return ( 
        <div id="messages" className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
            <div ref={scrollDownRef} />
             {messages.map((message, index) => {
                const isCurrentUser = message.senderId === sessionId

                const hasNextMessageFromtheSameUser = messages[index-1]?.senderId === messages[index]?.senderId

                return <div className="chat-message"
                key={`${message.id}-${message.timestamp}`}
                >
                 <div className={cn('flex items-center', {
                    'justify-end': isCurrentUser,
                 })}>

                    <div className={cn('flex flex-col text-base space-y-2 max-w-xs mx-2', {
                        'order-1, items-end': isCurrentUser,
                        'order-2 items-start': !isCurrentUser
                    })}>
                      <span className={cn('px-4 py-2 rounded-lg inline-block', {
                        'bg-indigo-600 text-white': isCurrentUser,
                        'bg-gray-200 text-gray-900': !isCurrentUser,
                        'rounded-br-none': !hasNextMessageFromtheSameUser && isCurrentUser,
                        'rounded-bl-none': !hasNextMessageFromtheSameUser && !isCurrentUser,
                      })}>
                        {message.text}{' '}
                        <span className="ml-2 text-xs text-gray-400">
                            {formatTimestamp(message.timestamp)}
                        </span>
                      </span>
                    </div>
                    {/* difference btw invisible and hidden is that invisible will take up the space but will not show the content while hidden completly removes it from the page */}
                    <div className={cn('relative w-6 h-6', {
                        'order-1': !isCurrentUser,
                        'order-2': isCurrentUser,
                        'invisible': hasNextMessageFromtheSameUser
                    })}>
                        <Image
                        fill
                        src={isCurrentUser? (sessionImg as string) : chatPartner.image}
                        alt="Profile picture"
                        referrerPolicy="no-referrer"
                        className="rounded-full"
                        />
                    </div>
                 </div>
                </div>
             })}
        </div>
     );
}
 
export default Messages;
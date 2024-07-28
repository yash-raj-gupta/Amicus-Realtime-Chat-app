import ChatInputs from "@/components/ChatInputs";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validation/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FunctionComponent } from "react";
interface PageProps {
    params: {
        chatId: string
    }
}


async function getChatMessages(chatId:string) {
    try {
        const results: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1)


        const dbMessages = results.map((message) => JSON.parse(message) as Message)

        const reversedDbMessages = dbMessages.reverse()

        const messages = messageArrayValidator.parse(reversedDbMessages)

        return messages

    } catch (error) {
        notFound()
    }
}
 
const page = async ({params}: PageProps) => {


    const {chatId} = params;

    const session = await getServerSession(authOptions)
    if(!session) notFound()

        const {user} = session;

        const [userId1, userId2] = chatId.split('--');

        if(user.id !== userId1 && user.id !== userId2)
        {
            notFound()
        }

        const chatPartnerId = user.id === userId1 ? userId2: userId1;
        const chatPartnerDetails = (await fetchRedis('get', `user:${chatPartnerId}`)) as string
        const chatPartner = JSON.parse(chatPartnerDetails) as User

        const initialMessages = (await getChatMessages(chatId))
    return ( 
        <div className="flex-1 flex flex-col justify-between h-full max-h-[calc(100vh-6rem)]">
            <div className="flex justify-between sm:items-center border-b-2 border-gray-200 py-3">
                <div className="relative flex space-x-4 items-center">
                    <div className="relative">

                        <div className="w-8 h-8 sm:h-12 sm:w-12 relative">
                            <Image  
                            fill
                            referrerPolicy="no-referrer"
                            src={chatPartner.image}
                            alt={`${chatPartner.name} profile picture`}
                            className="rounded-full"
                            
                            />
                        </div>
                    </div>
                    <div className="flex flex-col leading-tight">
                     <div className="text-xl flex items-center">
                        <span className="text-gray-700 mr-3 font-semibold">{chatPartner.name}</span>
                     </div>
                     <span className="text-sm text-gray-600">{chatPartner.email}</span>
                    </div>
                </div>
            </div>
             <Messages sessionImg={session.user.image} chatPartner={chatPartner} chatId={chatId} sessionId={session.user.id} initialMessages={initialMessages}/>
             <ChatInputs chatPartner={chatPartner} chatId={chatId}/>
        </div>
     );
}
 
export default page;
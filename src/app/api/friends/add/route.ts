import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { addFriendValidator } from "@/lib/validation/add-friend"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request){
    try {
        const body = await req.json()
        
        const {email: emailToAdd} = addFriendValidator.parse(body.email)
        
        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string
        
           console.log("id", idToAdd)
           if(!idToAdd){
            return new Response('This person does not exist', {status: 400})
           }

           const session = await getServerSession(authOptions)
           const idCurrent = await fetchRedis('get', `user:email:${session?.user.email}`) as string
             console.log("session", idCurrent)
            if(!session){
                return new Response('Unauthorized', {status: 401})
            }

            if(idToAdd === idCurrent){
                return new Response('You cannot add yourself as a friend', {status: 400});
            }
            
            const isAlreadyAdded = await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, idCurrent) as 0 | 1;

            if(isAlreadyAdded){
                throw new Response('Already added the user', {status: 400})
            }
            const isAlreadyFriends = await fetchRedis('sismember', `user:${idCurrent}:friends`, idToAdd) as 0 | 1;

            if(isAlreadyFriends){
                throw new Response('Already friends with this user', {status: 400})
            }


            // before adding it in the db we need to trigger the pusher so that in realtime the client is notified of the same
            pusherServer.trigger(
                toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
                'incoming_friend_requests',
                {
                    senderId: session.user.id,
                    senderEmail: session.user.email
                }
            )

            db.sadd(`user:${idToAdd}:incoming_friend_requests`, idCurrent)

            return new Response('OK')
    } catch (error) {
        if(error instanceof z.ZodError){
               return new Response ('Invalid request Payload', {status: 422})
        }

        return new Response('Invalid request', {status: 400})
        
    }
}
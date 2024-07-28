import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod"

export async function POST(req: Request)
{
    try {
        const body = await req.json()

        const {id: idToAdd} = z.object({ id: z.string()}).parse(body);

        const session =await getServerSession(authOptions);

        if(!session){
            throw new Response ('Unauthorized', {status: 401});
        }

        const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd);

        if(isAlreadyFriends){
            throw new Response('Already are friends', {status: 400})
        }
        const hasFriendRequests = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd);
          
        if(!hasFriendRequests){
            throw new Response('No friend Requests', {status: 400})
        }

        pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`), 'new_friend', {})

        await db.sadd(`user:${session.user.id}:friends`, idToAdd)

        await db.sadd(`user:${idToAdd}:friends`, session.user.id)

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)


        return new Response ('Ok', {status: 200});
    } catch (error) {
        if(error instanceof z.ZodError){
            throw new Response('Invalid Request payload', {status: 422})
        }

        return new Response('Invalid Request', {status: 400})
    }

}
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod"

export async function POST(req: Request)
{
    try {
        const body = await req.json()

        const {id: idToDeny} = z.object({ id: z.string()}).parse(body);

        const session =await getServerSession(authOptions);

        if(!session){
            throw new Response ('Unauthorized', {status: 401});
        }

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny)

        return new Response ('Ok', {status: 200});
    } catch(error){
        if(error instanceof z.ZodError){
            throw new Response('Invalid Request payload', {status: 422})
        }

        return new Response('Invalid Request', {status: 400})


    }
}
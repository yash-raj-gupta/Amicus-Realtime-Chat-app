import { fetchRedis } from "./redis"

export const getFriendsByUserId = async (userId: string) =>{

    const friendsId = await fetchRedis('smembers', `user:${userId}:friends`) as string[]

    const friends = await Promise.all(friendsId.map(async (friendId) => {
        const friend = await fetchRedis('get', `user:${friendId}`) as string
        const parsedFriend = JSON.parse(friend) as User
        return parsedFriend
        // const sender = await fetchRedis('get', `user:${senderId}`) as string
        // const senderParse = JSON.parse(sender) as User
    }))
     return friends
}
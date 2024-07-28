"use client"
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FunctionComponent , useEffect, useState} from "react";

interface FriendRequestsProps {
    initialFriendRequest: IncomingFriendRequest[],
    sessionId: string
}
 
const FriendRequests: FunctionComponent<FriendRequestsProps> = ({
    initialFriendRequest,
    sessionId}) => {

        const router = useRouter();
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
        initialFriendRequest
    )

    //going to subscribe to any friend requests changes ae done in the server
    // we are using the function toPusherKey because pusher invalidates : in the links
    useEffect(()=> {
      pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))

      const friendRequestHandler = ({senderId, senderEmail}: IncomingFriendRequest) => {
        setFriendRequests((prev) => [...prev, {senderId, senderEmail}])
      }
// binding tells pusher what to do
      pusherClient.bind('incoming_friend_requests', friendRequestHandler)

      return () => {
        pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
        pusherClient.unbind('incoming_friend_requests', friendRequestHandler)

      }
    },[sessionId])
     

    const acceptFriend = async (senderId: string) => {
        await axios.post('/api/friends/accept', {id: senderId})

        setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))

        router.refresh()
    }

    const denyFriend = async (senderId: string) => {
        await axios.post('/api/friends/deny', {id: senderId})

        setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))

        router.refresh()
    }


    


    return ( 
        <>
       {friendRequests.length === 0 ? (

        <p className="text-sm text-zinc-500">Nothing to show here ...</p>
       ): (
        friendRequests.map((request) => (
            <div className="flex items-center gap-4" key={request.senderId}>
              <UserPlus className="text-black"/>
              <p className="font-medium text-lg">{request.senderEmail}</p>

              <button
                onClick={() => acceptFriend(request.senderId)}
               className="w-8 h-8 grid place-items-center bg-indigo-600 hover:bg-indigo-700 rounded-full transition hover:shadow-md" aria-label="accept friend">
                <Check className="text-white font-semibold w-3/4 h-3/4"/>
                </button>
              <button
              onClick={() => denyFriend(request.senderId)}
               className="w-8 h-8 grid place-items-center bg-red-600 hover:bg-red-700 rounded-full transition hover:shadow-md" aria-label="accept friend">
                <X className="text-white font-semibold w-3/4 h-3/4"/>
                </button>

            </div>
        ))
       )}
        </>
     );
}
 
export default FriendRequests;
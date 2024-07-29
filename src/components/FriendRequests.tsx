"use client"
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import axios from 'axios'
import { Check, UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[]
  sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  const router = useRouter()
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  )

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    )

    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) => {
      setFriendRequests((prev) => [...prev, { senderId, senderEmail }])
    }

    pusherClient.bind('incoming_friend_requests', friendRequestHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      )
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
    }
  }, [sessionId])

  const acceptFriend = async (senderId: string) => {
    await axios.post('/api/friends/accept', { id: senderId })

    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    )

    router.refresh()
  }

  const denyFriend = async (senderId: string) => {
    await axios.post('/api/friends/deny', { id: senderId })

    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    )

    router.refresh()
  }
    


    return ( 
        <>
       {friendRequests.length === 0 ? (

        <p className="text-sm text-zinc-500">Nothing to show here ...</p>
       ): (
        friendRequests.map((request) => (
            <div className="flex flex-col justify-center gap-4" key={request.senderId}>
             <div className="flex gap-2">
             <UserPlus className="text-black"/>
              <p className="font-medium text-lg sm:text-ellipsis ">{request.senderEmail}</p>
             </div>
              <div className=" flex ml-2 gap-4">
              <button
                onClick={() => acceptFriend(request.senderId)}
               className=" w-20 p-2 h-full grid place-items-center bg-indigo-600 hover:bg-indigo-700 rounded-md transition hover:shadow-md" aria-label="accept friend">
                <p className="text-white font-semibold">Accept</p>
                </button>
              <button
              onClick={() => denyFriend(request.senderId)}
               className=" w-20 h-full p-2 grid place-items-center bg-red-600 hover:bg-red-700 rounded-md transition hover:shadow-md" aria-label="accept friend">
                <p className="text-white font-semibold">Deny</p>
                </button>

              </div>
              
            </div>
        ))
       )}
        </>
     );
}
 
export default FriendRequests;
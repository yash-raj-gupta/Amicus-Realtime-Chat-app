"use client"

import { User } from "lucide-react";
import Link from "next/link";
import { FunctionComponent, useState, useEffect } from "react";
import { pusherClient} from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";


interface FriendRequestsSidebarOptionsProps {
    sessionId: string,
    initialUnseenRequestCount:  number
}
 
const FriendRequestsSidebarOptions: FunctionComponent<FriendRequestsSidebarOptionsProps> = ({ 
    sessionId,
    initialUnseenRequestCount}) => {
    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
        initialUnseenRequestCount
    )

    //going to subscribe to any friend requests changes ae done in the server
    // we are using the function toPusherKey because pusher invalidates : in the links
    useEffect(()=> {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
  
        const friendRequestHandler = ({senderId, senderEmail}: IncomingFriendRequest) => {
            setUnseenRequestCount((prev) => prev+1)
        }
  // binding tells pusher what to do
        pusherClient.bind('incoming_friend_requests', friendRequestHandler)
  
        return () => {
          pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
          pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
  
        }
      },[sessionId])
    
      

    return ( 
        <Link href={'/dashboard/requests'} className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
            <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium  bg-white">
              <User className="h-4 w-4"/>
            </div>
            <p className="truncate">Friend Requests</p>
            {unseenRequestCount  > 0 ? (
                <div className="rounded-full h-5 w-5 text-xs flex justify-center items-center
                text-white bg-indigo-600">
                   {unseenRequestCount}
                </div>
            ): null}
        </Link>
     );
}
 
export default FriendRequestsSidebarOptions;
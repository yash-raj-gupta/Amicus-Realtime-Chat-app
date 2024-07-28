import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FunctionComponent, ReactNode } from "react";
import Link from "next/link";
import { Icon, Icons } from "@/components/Icons";
import Image from "next/image";
import { Sign } from "crypto";
import SignOutButton from "@/components/SignOutButton";
import FriendRequestsSidebarOptions from "@/components/FriendRequestsSidebarOptions";
import { fetchRedis } from "@/helpers/redis";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import SidebarChatList from "@/components/SidebarChatList";
interface LayoutProps {
    children: ReactNode
}

interface SidebarOption{
    id: number,
    name: string,
    href: string,
    Icon: Icon

}
     const sidebarOptions : SidebarOption[] = [
        {
            id: 1, name: 'Add a friend', 
            href: '/dashboard/add',
            Icon: 'UserPlus'
        }
     ]
 
const Layout = async ({children}: LayoutProps) => {

    const session = await getServerSession(authOptions)

    if(!session) notFound()
        const unseenRequestCount = (await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`)as User[]).length

    const friends = await getFriendsByUserId(session.user.id);


    return ( 
        <div className="w-full flex h-screen">
            
            <div className="flex grow max-w-xs w-full h-full flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6 bg-white">
            <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
            <Icons.Logo className="h-8 w-auto text-indigo-600"/>
            </Link>
           {friends.length > 0 ?  <div className="font-semibold text-xs leading-6 text-gray-400">
                Your Chats
            </div>: null}
            <nav className="flex flex-col flex-1">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <SidebarChatList friends={friends} sessionId={session.user.id}/>
                          </li>
                    <li >
                        <div className="text-xs font-semibold leading-6 text-gray-400">
                            Overview
                        </div>
                        <ul className="-mx-2 mt-2 space-y-1">
                           {sidebarOptions.map((option) => {
                            const Icon = Icons[option.Icon]
                            return (
                                <li key={option.id}>
                                    <Link href={option.href}
                                    className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 group flex rounded-md p-2 gap-3 text-sm leading-6 font-semibold"
                                    >
                                      <span className="text-gray-400 border-gray-200 group-hover:text-indigo-600 group-hover:border-indigo-600 h-6 w-6 items-center justify-center shrink-0 flex text-[0.625rem] font-medium border bg-white rounded-lg">

                                        <Icon className="w-4 h-4"/>
                                      </span>
                                      <span className="truncate">
                                        {option.name}
                                      </span>
                                    </Link>
                                </li>
                            )
                           })}
                           
                    <li>
                        <FriendRequestsSidebarOptions
                        sessionId={session.user.id}
                        initialUnseenRequestCount={unseenRequestCount}
                        />
                    </li>
                        </ul>
                    </li>

                    <li className="-mx-6 mt-auto flex items-center">
                        <div className="flex flex-1 px-6 py-3 space-x-4 text-sm font-semibold items-center leading-6 text-gray-900">
                            <div className="w-8 h-8 relative bg-gray-50">
                               <Image
                               fill
                               referrerPolicy="no-referrer"
                               className="rounded-full"
                               src={session.user.image || ''}
                               alt="Your profile picture"
                               />
                            </div>
                            <span className="sr-only">Your  profile</span>
                            <div className="flex flex-col">
                                <span aria-hidden='true'>{session.user.name}</span>
                                <span aria-hidden='true'  className="text-xs text-zinc-400
                                ">{session.user.email}</span>
                            </div>
                        </div>
                        <SignOutButton className="h-full flex justify-center items-center aspect-square"/>
                    </li>
                </ul>
            </nav>
            </div>
            <aside className="max-h-screen py-16 w-full container md:py-12">
            {children}
            </aside>
        </div>
     );
}
 
export default Layout;
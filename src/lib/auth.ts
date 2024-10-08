import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { NextAuthOptions } from "next-auth";
import { db } from "./db";
import GithubProvider from "next-auth/providers/github";
import { fetchRedis } from "@/helpers/redis";


function getGithubCredentials(){
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if(!clientId || clientId.length === 0){
        throw new Error('Missing GITHUB_CLIENT_ID')
    }

    if(!clientSecret || clientSecret.length === 0){
        throw new Error('Missing GITHUB_CLIENT_SECRET')
    }

    return{ clientId, clientSecret}

}
export const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db),
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/login'
    },
    providers: [
        GithubProvider({
            clientId: getGithubCredentials().clientId,
            clientSecret: getGithubCredentials().clientSecret,
            httpOptions: {
                timeout: 10000
              }
        })
    ],
    callbacks: {
        async jwt ({token, user}){
            const dbUserResult = await fetchRedis('get', `user:${token.id}`) as string | null;
            if(!dbUserResult){
                token.id = user?.id;
                return token;
            }

            const dbUser = JSON.parse(dbUserResult) as User;

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image
            }
        },
        async session({session, token}){
            if(token){
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
            }

            return session;
        },
        redirect(){
            return '/dashboard'
        }
    },

}
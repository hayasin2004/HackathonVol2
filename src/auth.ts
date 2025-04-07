import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prismaClient"
import NextAuth, {NextAuthOptions} from "next-auth";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {findPlayerData} from "@/repository/prisma/authRepository";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "email", type: "text", placeholder: "email"},
                password: {label: "password", type: "password"}
            },
            async authorize(credentials) {
                if (!credentials?.email) {
                    throw new Error("メールアドレスが入力されていません");
                }

                const user = await prisma.user.findFirst({
                    where: {
                        AND: [{
                            email: credentials.email,
                            password: credentials.password
                        }]
                    },
                });

                if (!user) {
                    throw new Error("ユーザーを見つけれませんでした。もう一度、メールアドレス、パスワードを入力してください")
                }


                // ユーザーが存在する場合のみ値を返す
                if (user) {
                    await findPlayerData(user.id)
                    return {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                    };
                }
            }
        })
    ]
    , callbacks: {
        async session({session, token}) {
            if (token) {
                session.user.id = token.id as number
                session.user.username = token.username as string
            }
            return session
        },

        async jwt({token, user}) {
            if (user) {
                token.id = user.id
                token.username = user.username
            }
            console.log("auth token : " + token)
            return token
        }
    },
    pages: {
        signIn: "/login",
        signOut: "/",
    },
}

export const {handlers, auth, signIn, signOut} = NextAuth(authOptions)
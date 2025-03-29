import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id: number;
        email: string;
        username: string;
    }

    interface Session {
        user: User;
    }

    interface JWT {
        id: number;
        username: string;
    }
}
"use server"
import prisma from "@/lib/prismaClient";

export const following = async (followingId , followerId) => {
//     followingId →　フォローする人 , followerId →　フォローされる人
    const currentUser = await prisma.user.findFirst({where: {id: followingId}})
}
"use server"
import prisma from "@/lib/prismaClient";
import { propsPlayerType } from "@/types/Player";

export const following = async (currentUserId: number | undefined, targetUser: propsPlayerType | null) => {
    try {
        // 引数のバリデーション
        if (!currentUserId || !targetUser?.detailPlayer?.id) {
            console.log("followerExists" + currentUserId , "followingsExists" + JSON.stringify(targetUser?.detailPlayer?.id))

            throw new Error("currentUserId または targetUser が無効です");
        }

        // フォロワーとフォローされる人の存在確認
        const followerExists = await prisma.user.findUnique({ where: { id: targetUser?.detailPlayer?.id } });
        const followingsExists = await prisma.user.findUnique({ where: { id: currentUserId } });

        if (!followerExists || !followingsExists) {
            console.log("followerExists" + followerExists , "followingsExists" + followingsExists)
            console.log("ユーザーが存在しません");
            return null;
        }

        // すでにフォローしているか確認
        const alreadyFollowing = await prisma.follow.findFirst({
            where: {
                followingsId: targetUser?.detailPlayer?.id,
                followersId: currentUserId,
            },
        });
        if (alreadyFollowing) {
            console.log("既にフォローしています。");
            return null;
        }

        // フォローを作成
        const follow = await prisma.follow.create({
            data: {
                followingsId: targetUser?.detailPlayer?.id,
                followersId: currentUserId,
            },
        });

        console.log("follow : ", follow);
        return follow;
    } catch (err) {
        console.error("エラー: ", err);
        return null;
    }
};
"use server"
import prisma from "@/lib/prismaClient";
import {propsPlayerType} from "@/types/Player";

export const following = async (currentUserId: number | undefined, targetUser: propsPlayerType | null) => {
    try {
        // 引数のバリデーション
        if (!currentUserId ||  !targetUser?.detailPlayer?.id) {
            console.log("followerExists" + currentUserId, "followingsExists" + JSON.stringify(targetUser?.detailPlayer?.id))

            throw new Error("currentUserId または targetUser が無効です");
        }
        if (currentUserId =  targetUser?.detailPlayer?.id) {
            throw new Error("自分はフォローできないです");
        }


        // フォロワーとフォローされる人の存在確認
        const followerExists = await prisma.user.findUnique({where: {id: targetUser?.detailPlayer?.id}});
        const followingsExists = await prisma.user.findUnique({where: {id: currentUserId}});

        if (!followerExists || !followingsExists) {
            console.log("followerExists" + followerExists, "followingsExists" + followingsExists)
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

            //  followersId_followingsId 　→　複合キー
            //  prisma.SchemaのFollowモデルで、@@unique([followingsId , followersId])としてると複合キー扱いになる。
            const DeleteFollow = await prisma.follow.delete({
                where: {
                    followersId_followingsId: {
                        followingsId: targetUser?.detailPlayer?.id,
                        followersId: currentUserId,
                    }
                },
            });
            console.log(DeleteFollow)
            return null;
        }

        // フォローを作成
        // followingsIdに作成されるのがフォロー対象の人
        // followersIdがフォローボタン押した人（ログインしている自分）
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
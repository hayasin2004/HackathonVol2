import React from 'react';
import prisma from "@/lib/prismaClient";
import DetailFollowButton from "@/components/followButton/detailfollowbutton/DetailFollowButton";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {DetailPlayerTypes} from "@/types/Player";
import UpdateUser from "@/app/(userAuth)/updateUser/page";


const DetailPlayer = async ({params}: { params: { id: string } }) => {
    const currentUserName = decodeURIComponent(params.id);

    const detailPlayerData = await prisma.user.findFirst({where: {username: currentUserName}})

    const session = await getServerSession(authOptions)

    console.log("session　サーバ側" + JSON.stringify(session))
    console.log(JSON.stringify(detailPlayerData))
    const detailPlayerDataFollowingsList = await prisma.follow.findMany({
        where: {
            followersId: detailPlayerData?.id,
            followingsId: {not: detailPlayerData?.id}
        }, select: {
            followings: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    })

    const detailPlayerDataFollowersList = await prisma.follow.findMany({
        where: {followingsId: detailPlayerData?.id}, // ログイン中のユーザーがフォロワーであるデータ
        select: {
            followers: { // フォローされるユーザー情報を取得
                select: {
                    id: true,
                    username: true,
                    email: true, // 必要に応じて追加
                },
            },
        },
    });

    console.log("これはこの人のフォロー一覧です" + detailPlayerDataFollowingsList);
    console.log("これはこの人のフォロワー一覧です!!!" + JSON.stringify(detailPlayerDataFollowersList));
    return (
        <>
            {session?.user?.id == detailPlayerData?.id ?
                <ToShowMeDetail
                    detailPlayerData={detailPlayerData}
                    detailPlayerDataFollowingsList={detailPlayerDataFollowingsList}
                    detailPlayerDataFollowersList={detailPlayerDataFollowersList}
                />
                :
                <ToShowOtherDetail
                    detailPlayerData={detailPlayerData}
                    detailPlayerDataFollowingsList={detailPlayerDataFollowingsList}
                    detailPlayerDataFollowersList={detailPlayerDataFollowersList}
                />
            }
        </>
    );
}
export default DetailPlayer;

//もし見ているユーザーが自分だった時のコンポーネント
const ToShowMeDetail: React.FC<DetailPlayerTypes> = async ({
                                                               detailPlayerData,
                                                               detailPlayerDataFollowingsList,
                                                               detailPlayerDataFollowersList
                                                           }) => {
    return (
        <div>
            <h1>ここは自分のページです</h1>
            <h2>Id : {detailPlayerData?.id}</h2>
            <h3>Username : {detailPlayerData?.username}</h3>
            <div>
                <h1>ここでフォロー一覧</h1>
                {detailPlayerDataFollowingsList.map((followingUserData, index) => (
                    <div key={followingUserData.followings.id}>
                        <h2>{index + 1}番目 :{followingUserData.followings.username}</h2>
                        <DetailFollowButton detailPlayer={followingUserData}/>
                    </div>
                ))}
            </div>
            <div>
                <h1>ここで個人情報の変更</h1>
                <UpdateUser detailPlayer={detailPlayerData}/>
                <h3>Username : {detailPlayerData?.username}</h3>
            </div>
            <div>
                <h1>ここでフォロワー一覧</h1>
                {detailPlayerDataFollowersList?.map((followerUserData, index) => (
                    <div key={followerUserData.followers.id}>
                        <h2>{index + 1}番目 :{followerUserData.followers.username}</h2>
                    </div>
                ))}
            </div>
        </div>
    )
}

//もし見ているユーザーが自分じゃなかった時のコンポーネント
const ToShowOtherDetail: React.FC<DetailPlayerTypes> = async ({
                                                                  detailPlayerData,
                                                                  detailPlayerDataFollowingsList,
                                                                  detailPlayerDataFollowersList
                                                              }) => {
    return (
        <div>
            <h1>ここは他の人のページです</h1>
            <h2>Id : {detailPlayerData?.id}</h2>
            <h3>Username : {detailPlayerData?.username}</h3>
            <div>
                <h1>ここでフォロー一覧</h1>
                {detailPlayerDataFollowingsList?.map((followingUserData, index) => (
                    <div key={followingUserData.followings.id}>
                        <h2>{index + 1}番目 :{followingUserData.followings.username}</h2>
                        <DetailFollowButton detailPlayer={followingUserData}/>
                    </div>
                ))}
            </div>
            <div>
                <h1>ここでフォロワー一覧</h1>
                {detailPlayerDataFollowersList?.map((followerUserData, index) => (
                    <div key={followerUserData.followers.id}>
                        <h2>{index + 1}番目 :{followerUserData.followers.username}</h2>
                    </div>
                ))}
            </div>
        </div>
    )
}
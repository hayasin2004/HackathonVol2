import React from 'react';
import prisma from "@/lib/prismaClient";
import DetailFollowButton from "@/components/followButton/detailfollowbutton/DetailFollowButton";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {DetailPlayerTypes} from "@/types/Player";


const DetailPlayer = async ({params}: { params: { id: string } }) => {
    const currentUserName = decodeURIComponent(params.id);
    const detailPlayerData = await prisma.user.findFirst({where: {username: currentUserName}})
    const session = await getServerSession(authOptions)
    console.log("session　サーバ側" + JSON.stringify(session))
        console.log(JSON.stringify(detailPlayerData))
    const detailPlayerDataFollowingsList  = await prisma.follow.findMany({
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
const ToShowMeDetail:React.FC<DetailPlayerTypes> = async ({detailPlayerData, detailPlayerDataFollowingsList, detailPlayerDataFollowersList}) => {
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
                1、編集ボタンのみコンポーネントディレクトリにクライアントコンポーネントで作成詳しくは
                components/DetailFollowButtonの中身みたいな感じで
                2、コンポーネントを呼び出したら、プロップスで今のログインしているユーザーの情報(id)で渡す。
                　→受け取るときは8行目らへんを参考にしてもらって
                3、コンポーネントでボタンのOnClickでEdit用の関数を呼び出する。
                　→　非同期関数はrepository/prismaに更新用の関数を作成してほしい
                4、更新する内容はメールアドレス、ユーザー名、自己紹介、プロフィール画像
                ＊＊＊
                    なにも変更がないInputタグがある状態で関数を実行したときにnull,undefinedにデータが空になるのを防いでほしい
                ＊＊＊
            </div>
            <div>
                <h1>ここで個人情報の変更</h1>

                <h2>変更前アイコン : {detailPlayerData?.username}</h2>
                <h2>変更後アイコン : </h2>

                <h2>変更前ID : {detailPlayerData?.id}</h2>
                <h2>変更後ID : </h2>

                <h2>変更前Username : {detailPlayerData?.username}</h2>
                <h2>変更後Username : </h2>

                <h2>変更前自己紹介 : {detailPlayerData?.username}</h2>
                <h2>変更後自己紹介 : </h2>


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
const ToShowOtherDetail:React.FC<DetailPlayerTypes> = async ({detailPlayerData, detailPlayerDataFollowingsList, detailPlayerDataFollowersList}) => {
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
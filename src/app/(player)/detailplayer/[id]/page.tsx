import React from 'react';
import prisma from "@/lib/prismaClient";
import DetailFollowButton from "@/components/followButton/detailfollowbutton/DetailFollowButton";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {DetailPlayerTypes} from "@/types/Player";
import  styles from './page.module.css';
import Tabs from "@/components/Tabs/Tabs";
import Link from "next/link";



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
        <div className="mypage-container">
            <h1 className="mypage-title">My Page</h1>

            <section className="mypage-section">
                <h2 className="section-title">ユーザー情報</h2>
                <p><strong>Username:</strong> {detailPlayerData?.username}</p>
            </section>

            <section className="mypage-section">
                <h2 className="section-title">フォロー一覧</h2>
                {detailPlayerDataFollowingsList.length > 0 ? (
                    detailPlayerDataFollowingsList.map((followingUserData, index) => (
                        <div key={followingUserData.followings.id} className="user-card">
                            <span>{index + 1}. {followingUserData.followings.username}</span>
                            <DetailFollowButton detailPlayer={followingUserData}/>
                        </div>
                    ))
                ) : (
                    <p>フォローしているユーザーはいません。</p>
                )}
            </section>

            <section className="mypage-section">
                <h2 className="section-title">フォロワー一覧</h2>
                {detailPlayerDataFollowersList.length > 0 ? (
                    detailPlayerDataFollowersList.map((followerUserData, index) => (
                        <div key={followerUserData.followers.id} className="user-card">
                            <span>{index + 1}. {followerUserData.followers.username}</span>
                        </div>
                    ))
                ) : (
                    <p>フォロワーはいません。</p>
                )}
            </section>

            <section className="mypage-section">
                <h2 className="section-title">アカウント設定</h2>
                <Link href="/updateUser">
                    <button className="update-button">情報更新</button>
                </Link>
            </section>
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
        <div className={styles.tabs}>
            <h1>{detailPlayerData?.username}さんのページです</h1>
            <h2>Id : {detailPlayerData?.id}</h2>
            <h3>Username : {detailPlayerData?.username}</h3>
            <div>
                <Tabs/>
            </div>
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
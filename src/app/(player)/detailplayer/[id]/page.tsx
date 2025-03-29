import React from 'react';
import prisma from "@/lib/prismaClient";
import FollowButton from "@/components/followButton/FolloButton";
import {PlayerType} from "@/types/Player";

const DetailPlayer = async ({params}: { params :{id: string}}) => {
    const currentUserId = decodeURIComponent(params.id);
    const detailPlayerData = await prisma.user.findFirst({where: {username: currentUserId}})
    console.log(detailPlayerData);
    return (
        <div>
            <h1>ここはallplayerで詳細を押したプレイヤーの詳細が見れるページです</h1>
            <h2>Id : {detailPlayerData?.id}</h2>
            <h3>Username : {detailPlayerData?.username}</h3>
            <FollowButton detailPlayer={detailPlayerData}/>
        </div>
    );
}


export default DetailPlayer;
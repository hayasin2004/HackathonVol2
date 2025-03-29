import React from 'react';
import prisma from "@/lib/prismaClient";

const DetailPlayer = async ({params}: { params :{id: string}}) => {

    const detailPlayerData = await prisma.user.findFirst({where: {username: params.id}})
    console.log(detailPlayerData);
    return (
        <div>
            <h1>ここはallplayerで詳細を押したプレイヤーの詳細が見れるページです</h1>
            <h2>Id : {detailPlayerData?.id}</h2>
            <h3>Username : {detailPlayerData?.username}</h3>
        </div>
    );
}


export default DetailPlayer;
import React from 'react';
import prisma from "@/lib/prismaClient";
import Link from "next/link";

const AllPlayer = async () => {
    const data = await prisma.user.findMany({select: {id: true, username: true, email: true}})
    console.log(data)
    return (
        <div>
            <h1>ここは今登録しているユーザーを一覧で表示するページです</h1>
            {data.map((playerItem) => (
                <div key={playerItem.id}>
                    <h2>ユーザー名 : {playerItem.username}</h2>
                    <Link href={`/detailplayer/${playerItem.username}`}>
                        <h3>詳細</h3>
                    </Link>
                </div>
            ))}
        </div>
    );
}


export default AllPlayer;
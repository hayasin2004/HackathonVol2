import React from 'react';
import prisma from "@/lib/prismaClient";
const AllPlayer = async () => {
    const data = await prisma.user.findMany({select : {id :true , username : true , email : true}})
    console.log(data)
    return (
        <div>
            <h1>ここは今登録しているユーザーを一覧で表示するページです</h1>
        </div>
    );
}


export default AllPlayer;
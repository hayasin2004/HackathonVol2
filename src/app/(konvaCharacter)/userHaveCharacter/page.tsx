import React from 'react';
import UserControllerKonva from "@/components/(konva)/userControllerKonva/UserControllerKonva";
import prisma from "@/lib/prismaClient";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";

const UserHaveCharacter = async () => {
    const session = await getServerSession(authOptions)

    const userHaveCharacterData = await prisma.character.findFirst({
        where: {
            userId: session?.user.id
        }
    })
    console.log("取得してきた userHaveCharacterData :" + JSON.stringify(userHaveCharacterData))
    return (
        <div>
            <h1>ここはユーザーの図形を操れるページ</h1>
            <h2><UserControllerKonva character={userHaveCharacterData}/></h2>
        </div>
    );
};

export default UserHaveCharacter;
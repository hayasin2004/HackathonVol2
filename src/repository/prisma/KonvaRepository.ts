"use server"
import prisma from "@/lib/prismaClient"
import {defaultShapes} from "@/types/konvaPartsImage";


export const konvaRepository = async (playerId: number | undefined, characterData: string | undefined) => {
    console.log("playerId" + playerId, " characterData" + characterData);
    try {
        if (playerId == undefined) {
            console.log("アカウントが削除されている可能性があります。")
            return {status: "error", message: "アカウントが削除されている可能性があります。"};
        } else {
            // 既に作成されているかの確認
            // 既にキャラクター作成されていた場合
            const existCharacterData = await prisma.character.findFirst({where: {userId: playerId}})
            if (existCharacterData) {
                console.log("既に作成されていたので更新をします。")
                if (characterData == "") {
                    console.log("何も選択されていない")
                    return {status: "error", message: "何も選択されていない"};
                }
                if (characterData == "circle") {
                    console.log("円を選択")
                    const circleCharacter = await prisma.character.update({
                        where :{
                           id : existCharacterData.id
                        },
                        data: {
                            userId: playerId,
                            parts: defaultShapes.circle,
                        },
                    });
                    console.log(circleCharacter);
                    return {status: "success"};
                }
                if (characterData == "triangle") {
                    console.log("三角形を選択")
                    const triangleCharacter = await prisma.character.update({
                        where :{
                            id : existCharacterData.id
                        },
                        data: {
                            userId: playerId,
                            parts: defaultShapes.triangle,
                        },
                    });
                    console.log(triangleCharacter);
                    return {status: "success"};

                }

                if (characterData == "square") {
                    console.log("四角形を選択")
                    const squareCharacter = await prisma.character.update({
                        where :{
                            id : existCharacterData.id
                        },
                        data: {
                            userId: playerId,
                            parts: defaultShapes.square,
                        },
                    });
                    console.log(squareCharacter);
                    return {status: "success"};

                }
            } else {

                // 既にキャラクター作成されていなかった場合
                console.log("新規作成をします。")
                if (characterData == "") {
                    console.log("何も選択されていない")
                    return {status: "error", message: "何も選択されていない"};
                }
                if (characterData == "circle") {
                    console.log("円を選択")
                    const circleCharacter = await prisma.character.create({
                        data: {
                            userId: playerId,
                            parts: defaultShapes.circle,
                        },
                    });
                    console.log(circleCharacter);
                    return {status: "success"};
                }
                if (characterData == "triangle") {
                    console.log("三角形を選択")
                    const triangleCharacter = await prisma.character.create({
                        data: {
                            userId: playerId,
                            parts: defaultShapes.triangle,
                        },
                    });
                    console.log(triangleCharacter);
                    return {status: "success"};

                }

                if (characterData == "square") {
                    console.log("四角形を選択")
                    const squareCharacter = await prisma.character.create({
                        data: {
                            userId: playerId,
                            parts: defaultShapes.square,
                        },
                    });
                    console.log(squareCharacter);
                    return {status: "success"};
                }
            }
        }
        return {status: "error", message: "サーバ側でのエラーです"};

    } catch (err) {
        console.log(err);
        return {status: "error", message: "サーバ側でのエラーです"};
    }
}

import {supabase} from "@/lib/supabase";
import {NextResponse} from "next/server";
import prisma from "@/lib/prismaClient";


export async function GET(req: Request) {
    try {
        const userId = req.url.split('/').pop(); // URLの最後の部分を取得
        const numUserId = Number(userId);

        if (!numUserId) {
            return NextResponse.json({status: 404, message: 'ユーザーIDがありませんでした'});
        }


        const userData = await prisma.character.findFirst({where: {userId: numUserId}, select: {iconImage: true}})

        if (!userData) {
            console.log("キャラクター作成" + numUserId)
            return NextResponse.json({status: 404, message: 'キャラクター情報が取得できませんでした'});
        }
        const filePaths = userData.iconImage.slice(0, 8);

        // 各キャラの最初の8枚の画像URLを作成 (Promise.allで並列処理を待機)
        // const urls = filePaths.map((path) => {
        //     const {data} = supabase.storage
        //         .from('hackathon2-picture-storage')
        //         .getPublicUrl(path);
        //     return data?.publicUrl;
        // });
        return NextResponse.json({status: 200, userData});


    } catch (error) {
        console.error('エラーが発生しました:', error);
        return NextResponse.json({status: 500, message: 'サーバーエラーが発生しました'});
    }
}
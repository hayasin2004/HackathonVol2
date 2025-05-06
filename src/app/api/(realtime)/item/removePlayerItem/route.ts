import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // リクエストボディを取得
        const { id } = body;

        if (!id) {
            return NextResponse.json({ message: "アイテムのIDが必要です。" }, { status: 400 });
        }

        // 指定されたIDのroomItemを削除（userIdがnullではない場合のみ）
        const deletedItem = await prisma.roomItem.deleteMany({
            where: {
                id: id,
                userId: {
                    not: null, // userIdがnullではない場合のみ削除
                },
            },
        });

        // 削除されたアイテムがない場合
        if (deletedItem.count === 0) {
            return NextResponse.json(
                { message: "該当するアイテムが見つからないか、userIdがnullです。" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "プレイヤーが設置したアイテムを削除しました。",
            deletedItem,
        });
    } catch (err) {
        console.error("アイテムを削除することができませんでした:", err);
        return NextResponse.json(
            { message: "サーバーエラーが発生しました。", error: err.message },
            { status: 500 }
        );
    }
}
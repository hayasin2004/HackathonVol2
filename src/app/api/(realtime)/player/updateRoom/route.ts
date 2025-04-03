import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";

export async function POST(req: Request) {
    try {
        const body = await req.json(); // リクエストボディの取得
        const { playerId, roomId } = body;

        if (!playerId) {
            return NextResponse.json(
                { status: "error", message: "プレイヤーIDが必要です" },
                { status: 400 }
            );
        }

        const playerData = await prisma.playerData.update({
            where: { playerId: playerId },
            data: {
                roomId: roomId ? roomId : null,
                // ランダムな初期位置を設定
                x: 100 + Math.floor(Math.random() * 100),
                y: 100 + Math.floor(Math.random() * 100),
            },
        });

        return NextResponse.json(
            {
                status: "success",
                message: "プレイヤーのルームを更新しました",
                playerData,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating player room:", error);
        return NextResponse.json(
            { status: "error", message: "プレイヤーのルーム更新に失敗しました" },
            { status: 500 }
        );
    }
}
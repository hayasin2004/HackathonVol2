import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";

export async function POST(req: Request) {
    try {
        const body = await req.json(); // リクエストボディを取得
        const { playerId, roomId } = body;

        if (!playerId) {
            return NextResponse.json(
                { status: "error", message: "プレイヤーIDが必要です" },
                { status: 400 }
            );
        }

        const playerData = await prisma.playerData.create({
            data: {
                roomId: roomId ? roomId : null,
                x: 100 + Math.floor(Math.random() * 100),
                y: 100 + Math.floor(Math.random() * 100),
            },
        });

        return NextResponse.json(
            {
                status: "success",
                message: "プレイヤーデータを作成しました",
                playerData,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating player:", error);
        return NextResponse.json(
            { status: "error", message: "プレイヤーデータの作成に失敗しました" },
            { status: 500 }
        );
    }
}
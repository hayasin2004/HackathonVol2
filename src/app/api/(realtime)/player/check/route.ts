import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");

    if (!playerId) {
        return NextResponse.json(
            { status: "error", message: "プレイヤーIDが必要です" },
            { status: 400 }
        );
    }

    try {
        const playerData = await prisma.playerData.findUnique({
            where: { playerId: parseInt(playerId, 10) }
        });

        return NextResponse.json({
            status: "success",
            exists: !!playerData,
            playerData
        });
    } catch (error) {
        console.error("Error checking player:", error);
        return NextResponse.json(
            { status: "error", message: "プレイヤー情報の確認に失敗しました" },
            { status: 500 }
        );
    }
}
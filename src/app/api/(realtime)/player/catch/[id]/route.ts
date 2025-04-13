import {NextResponse} from "next/server";
import prisma from "@/lib/prismaClient";

export async function GET(req: Request) {
    const playerId = req.url.split('/').pop(); // URLの最後の部分を取得
    const numberPlayerId = Number(playerId);
    console.log(numberPlayerId)
    if (!playerId || isNaN(numberPlayerId)) {
        return NextResponse.json(
            {status: "error", message: "無効なルームIDです"},
            {status: 400}
        );
    }

    try {
        const playerData = await prisma.playerData.findFirst({
            where: {playerId:numberPlayerId},
        });

        if (!playerData) {
            return NextResponse.json(
                {status: "error", message: "ルームが見つかりません"},
                {status: 404}
            );
        }

        return NextResponse.json({status: "success", playerData});


    } catch (error) {
        console.error("Error fetching numberPlayerId:", error);
        return NextResponse.json(
            {status: "error", message: "ユーザ情報の取得に失敗しました"},
            {status: 500}
        );
    }
}

export async function PUT(req: Request) {
    const {searchParams} = new URL(req.url);
    const playerId = searchParams.get("id");
    const numberPlayerId = Number(playerId);
    if (!playerId || isNaN(numberPlayerId)) {
        return NextResponse.json(
            {status: "error", message: "無効なルームIDです"},
            {status: 400}
        );
    }

    try {
        const body = await req.json();
        const {name} = body;
        // const updatePlayerData = await prisma.playerData.update({
        //     where: { id: numberPlayerId },
        // });

        return NextResponse.json({status: "success", numberPlayerId});
    } catch (error) {
        console.error("Error updating numberPlayerId:", error);
        return NextResponse.json(
            {status: "error", message: "ルームの更新に失敗しました"},
            {status: 500}
        );
    }
}

export async function DELETE(req: Request) {
    const {searchParams} = new URL(req.url);
    const playerId = searchParams.get("id");
    const NumPlayerId = Number(playerId)
    if (!playerId || isNaN(NumPlayerId)) {
        return NextResponse.json(
            {status: "error", message: "無効なルームIDです"},
            {status: 400}
        );
    }

    try {

        await prisma.playerData.delete({
            where: {id: NumPlayerId}
        });

        return NextResponse.json(
            {status: "success", message: "ルームを削除しました"},
            {status: 200}
        );
    } catch (error) {
        console.error("Error deleting numberPlayerId:", error);
        return NextResponse.json(
            {status: "error", message: "ルームの削除に失敗しました"},
            {status: 500}
        );
    }
}
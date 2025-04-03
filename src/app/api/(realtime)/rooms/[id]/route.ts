import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";

export async function GET(req: Request) {
    const roomId = req.url.split('/').pop(); // URLの最後の部分を取得

    if (!roomId || isNaN(roomId)) {
        return NextResponse.json(
            { status: "error", message: "無効なルームIDです" },
            { status: 400 }
        );
    }

    try {
        const NumRoomId = Number(roomId)
        const room = await prisma.room.findUnique({
            where: { id: NumRoomId },
            include: {
                players: true,
                items: {
                    where: { isActive: true },
                    include: { item: true }
                }
            }
        });

        if (!room) {
            return NextResponse.json(
                { status: "error", message: "ルームが見つかりません" },
                { status: 404 }
            );
        }

        return NextResponse.json({ status: "success", room });
    } catch (error) {
        console.error("Error fetching room:", error);
        return NextResponse.json(
            { status: "error", message: "ルーム情報の取得に失敗しました" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("id");

    if (!roomId || isNaN(roomId)) {
        return NextResponse.json(
            { status: "error", message: "無効なルームIDです" },
            { status: 400 }
        );
    }

    try {
        const body = await req.json();
        const { name } = body;
        const NumRoomId = Number(roomId)
        const room = await prisma.room.update({
            where: { id: NumRoomId },
            data: { name }
        });

        return NextResponse.json({ status: "success", room });
    } catch (error) {
        console.error("Error updating room:", error);
        return NextResponse.json(
            { status: "error", message: "ルームの更新に失敗しました" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("id");
    const NumRoomId = Number(roomId)
    if (!roomId || isNaN(roomId)) {
        return NextResponse.json(
            { status: "error", message: "無効なルームIDです" },
            { status: 400 }
        );
    }

    try {

        await prisma.room.delete({
            where: { id: NumRoomId }
        });

        return NextResponse.json(
            { status: "success", message: "ルームを削除しました" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting room:", error);
        return NextResponse.json(
            { status: "error", message: "ルームの削除に失敗しました" },
            { status: 500 }
        );
    }
}
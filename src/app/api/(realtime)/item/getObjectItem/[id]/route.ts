"use server";

// api/player/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";

export async function GET(req: Request) {
    const roomId = req.url.split("/").pop(); // URLの最後の部分を取得
    const numberRoomId = Number(roomId);

    try {
        const roomItems = await prisma.roomItem.findMany({ where: { roomId: numberRoomId } });

        if (!roomItems) {
            return NextResponse.json({ status: "error", message: "アイテムが見つかりません" }, { status: 404 });
        }

        return NextResponse.json({ status: "success", roomItems }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ status: "error", message: "アイテム取得中にエラーが発生しました" }, { status: 500 });
    }
}
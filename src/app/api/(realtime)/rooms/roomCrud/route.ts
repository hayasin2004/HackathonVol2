import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";

// GETリクエストのハンドラ
export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                players: true,
                items: {
                    where: { isActive: true },
                },
            },
        });

        return NextResponse.json({ status: "success", rooms });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return NextResponse.json(
            { status: "error", message: "ルーム情報の取得に失敗しました" },
            { status: 500 }
        );
    }
}

// POSTリクエストのハンドラ
export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json(
                { status: "error", message: "ルーム名は必須です" },
                { status: 400 }
            );
        }

        const room = await prisma.room.create({
            data: { name },
        });

        // ランダムアイテムを生成
        await generateRoomItems(room.id);

        return NextResponse.json({ status: "success", room }, { status: 201 });
    } catch (error) {
        console.error("Error creating room:", error);
        return NextResponse.json(
            { status: "error", message: "ルームの作成に失敗しました" },
            { status: 500 }
        );
    }
}

// アイテム生成関数
async function generateRoomItems(roomId: number) {
    try {
        const items = await prisma.defaultItemList.findMany();
        const itemCount = Math.floor(Math.random() * 6) + 5;

        const roomItems = [];
        for (let i = 0; i < itemCount; i++) {
            const randomItemIndex = Math.floor(Math.random() * items.length);
            const item = items[randomItemIndex];

            const x = Math.floor(Math.random() * 580) + 10;
            const y = Math.floor(Math.random() * 580) + 10;


            roomItems.push({
                roomId,
                itemId: item.id,
                x,
                y,
                isActive: true,
            });
        }

        await prisma.roomItem.createMany({ data: roomItems });
    } catch (error) {
        console.error("Error generating room items:", error);
        throw error;
    }
}
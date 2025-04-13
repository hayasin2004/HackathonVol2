import { NextResponse } from "next/server";
import { createPlayer, getPlayer } from "@/app/api/(realtime)/playerManagement/route";
import prisma from "@/lib/prismaClient";

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    const  numUserId =Number(userId)
    if (!userId) {
        return NextResponse.json(
            { error: "User ID is required" },
            { status: 400 }
        );
    }

    try {
        // createPlayer関数を呼び出し
        const result = await createPlayer(numUserId);
        return NextResponse.json(
            { status: "success", data: result },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in POST:", error);
        return NextResponse.json(
            { error: "Failed to create player", details: error },
            { status: 500 }
        );
    }
}

export async function GET() {



    try {
        // データベースからプレイヤーアイテムを取得
        const craftItems = await prisma.craftItem.findMany({
            include:{createdItem : true}
        });

        return NextResponse.json(
            { status: "success", craftItems },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching player items:", error);
        return NextResponse.json(
            { status: "error", message: "プレイヤーアイテムの取得に失敗しました" },
            { status: 500 }
        );
    }
}

export function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
        return NextResponse.json(
            { error: "User ID is required to DELETE" },
            { status: 400 }
        );
    }

    try {
        // DELETE処理を追加（仮）
        return NextResponse.json(
            { status: "error", message: "DELETE operation is not supported yet" },
            { status: 405 }
        );
    } catch (err) {
        console.error("Error in DELETE:", err);
        return NextResponse.json(
            { error: "Failed to delete player", details: err },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
        return NextResponse.json(
            { error: "User ID is required for PATCH" },
            { status: 400 }
        );
    }

    try {
        // PATCH処理を定義（仮）
        return NextResponse.json(
            { status: "error", message: "PATCH operation not implemented yet" },
            { status: 403 }
        );
    } catch (error) {
        console.error("Error in PATCH:", error);
        return NextResponse.json(
            { error: "Failed to patch player", details: error.message },
            { status: 500 }
        );
    }
}
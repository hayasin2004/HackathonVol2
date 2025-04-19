import {NextResponse} from "next/server";

interface putItemType {
    roomId: number,
    selectedItemId: number,
    playerDirection: { current: string },
    currentDirectionRef: { current: string },
    ECollisionPosition: { x: number, y: number },
    playerDataId: number
}

export async function POST(req: Request,) {

    try {
        const body = await req.json();
        const {
            selectedItemId,
            ECollisionPosition,
            playerDataId
        } = body

        console.log("中身" + playerDataId);
        if (!playerDataId || !selectedItemId || !ECollisionPosition) {
            return NextResponse.json(
                {status: 'error', message: 'ユーザーの情報もしくはアイテムに関するエラーです。'},
                {status: 400}
            );
        }

        const putItem = await route(body)
        return NextResponse.json(
            {status: 'success', message: 'アイテムを設置しました。', data: putItem},
            {status: 200}
        );

    } catch (err) {
        console.error("アイテム設置エラー", err);
        return NextResponse.json(
            {status: 'error', message: err || 'クラフト中にエラーが発生しました'},
            {status: 500}
        );
    }
}


async function route(itemData: putItemType) {
    const {
        roomId,
        selectedItemId,
        playerDirection,
        currentDirectionRef,
        ECollisionPosition,
        playerDataId
    } = itemData;

    // 向いている方向の調整
    let XPosition = 0
    let YPosition = 0

    if (currentDirectionRef.current == "ArrowLeft") {
        XPosition = -64
    }
    if (currentDirectionRef.current == "ArrowRight") {
        XPosition = 64
    }
    if (currentDirectionRef.current == "ArrowUp") {
        YPosition = 64
    }
    if (currentDirectionRef.current == "ArrowDown") {
        YPosition = -64
    }


    const updateRoomItemData = await prisma?.roomItem.create({
        data: {
            roomId: roomId,
            x: ECollisionPosition.x + XPosition,
            y: ECollisionPosition.y + YPosition,
            itemId: selectedItemId,
            userId: playerDataId,
            iconImage: "https://bfkeedzqlqqsaluqxplz.supabase.co/storage/v1/object/public/hackathon2-picture-storage/public/tree.png"
        }
    })

    return updateRoomItemData
}

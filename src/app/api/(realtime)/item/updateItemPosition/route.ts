import {NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const {itemId, newPosition} = await req.json();
    try {

        const roomItem =  await prisma.roomItem.findFirst({
            where: {itemId: itemId},
        });

        const updatedItem = await prisma.roomItem.update({
            where: {id: roomItem?.id},
            data: {x: newPosition.x, y: newPosition.y},
        });

        console.log("roomItemの位置情報を更新"+itemId , roomItem , updatedItem);
        console.log(updatedItem);
        return NextResponse.json(updatedItem, {status: 200});
    } catch (error) {
        console.error("Failed to update item position:", error);
        return NextResponse.json({error: 'Failed to update item position'}, {status: 500});
    }
}
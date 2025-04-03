import { NextResponse } from "next/server";
import { createPlayer, getPlayer } from "@/app/api/(realtime)/playerManagement/route";
import {NextApiRequest, NextApiResponse} from "next";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    return await createPlayer(req , res);
}

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    return await getPlayer(req , res);
}

export function DELETE(req: Request) {
    return NextResponse.json(
        { error: "Method DELETE Not Allowed" },
        { status: 405 }
    );
}

export async function PATCH(req: Request) {
    // Define PATCH behavior if needed, or block it.
    return NextResponse.json(
        { error: `PATCH in Progress` },
        { status: 403 }
    );
}
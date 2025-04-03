import { NextApiRequest, NextApiResponse } from 'next';
import { updatePlayerPosition } from "@/app/api/(realtime)/playerManagement/route";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'PUT':
            return await updatePlayerPosition(req, res);
        default:
            return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
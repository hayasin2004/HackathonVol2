import {NextRequest, NextResponse} from "next/server";
import {updateSession} from "@/utils/supabase/middleware";

export async function  middleware(req : NextRequest) {
    return await  updateSession(req)
}




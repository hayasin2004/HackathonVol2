import {NextRequest, NextResponse} from "next/server";
import {createServerClient} from "@supabase/ssr";

export async function updateSession(request : NextRequest){
    let supabaseResponse = NextResponse.next({
        request
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABESE_URL!,
        process.env.NEXT_PUBLIC_SUPABESE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value, options}) =>
                        request.cookies.set(name , value))
                    supabaseResponse = NextResponse.next({
                        request
                    })
                    cookiesToSet.forEach(({name, value, options}) =>
                        supabaseResponse.cookies.set(name,value,options)
                    )
                }
            }
        }
    )
}
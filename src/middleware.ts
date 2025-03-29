import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {withAuth} from "next-auth/middleware";
import {getToken} from "next-auth/jwt";


export default withAuth(async function middleware(req) {
    const token = await getToken({req});
    const isAuth = !!token

    // return NextResponse.redirect(new URL("/" , req.url))
}, {
    callbacks: {
        async authorized() {
            return true;
        }
    },
})


export const config = {
    matcher: ["/login"]
}

import {NextResponse} from "next/server";
import  type {NextRequest} from "next/server";
import {withAuth} from "next-auth/middleware";


export default withAuth(async  function middleware(req) {
    return NextResponse.redirect(new URL("/home" , req.url))
})


export const config = {
    matcher : "/"
}

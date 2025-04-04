"use client"
import {useSession} from "next-auth/react";
import {logout} from "@/lib/nextAuth-actions";
import {logIn} from "@/repository/prisma/authRepository";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

const LogIn = () => {
    const {data: session, status} = useSession();
    console.log(JSON.stringify(session))
    const router = useRouter()
    useEffect(() => {
        const  userId = session?.user.id
        const userPlayerData = async ()=> {
            if(status === 'authenticated' && userId){
                try{
                    const userData = await logIn(userId);
                    console.log(userData)
                    if (userData.status == "success"){
                        router.push("/createKonva")
                    }
                    else if (userData.status == "error"){
                        window.alert("ユーザー情報が見つかりませんでした。")
                    }

                }catch(err){
                    console.log(err)
                }
                return logIn
            }
            console.log(userPlayerData)
        }
    }, [session]);




    if (status === "loading") {
        return <p>読み込み中...</p>;
    }

    if (!session) {
        return <p>ログインしてください。</p>;
    }

    return (
        <div>
            <h1>ここはセッション管理用テストページです</h1>
            <p>ID : {session.user.id}</p>
            <p>Email : {session.user.email}</p>
            <p>Username : {session.user.username}</p>
            <p>PlayerID : {}</p>
            <form action={logout}>
                <button>
                    ログアウト
                </button>
            </form>
            <Link href='/updateUser'>
                <button>
                    情報変更
                </button>
            </Link>
        </div>
    );
}


export default LogIn;
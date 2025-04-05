"use client"
import {useSession} from "next-auth/react";
import {logout} from "@/lib/nextAuth-actions";
import {logIn} from "@/repository/prisma/authRepository";
import {useEffect} from "react";
import {useRouter} from "next/navigation";

const LogIn = () => {
    const {data: session, status} = useSession();
    console.log(JSON.stringify(session))
    const router = useRouter()
    useEffect(() => {
        const userPlayerData = async () => {
            const userId = session?.user.id
            if (userId) {
                try {
                    const userData = await logIn(userId);
                    console.log(userData)
                    if (userData.status == 200) {
                        // window.alert("おかえりなさい" + userData?.loginUser?.playerData?.playerId)
                        router.push("/createKonva")
                    } else if (userData.status == 201) {
                        window.alert("ユーザー情報が見つかりませんでした。")
                    } else if (userData.status == "error") {

                        window.alert("ユーザー情報が見つかりませんでした。")
                    }

                } catch (err) {
                    console.log(err)
                }
                return logIn
            }
        }
        userPlayerData()
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
        </div>
    );
}


export default LogIn;
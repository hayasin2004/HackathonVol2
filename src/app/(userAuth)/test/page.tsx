"use client"
import {useSession} from "next-auth/react";
import {logout} from "@/lib/nextAuth-actions";

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
            <form action={logout}>
                <button>
                    ログアウト
                </button>
            </form>
        </div>
    );
}


export default LogIn;
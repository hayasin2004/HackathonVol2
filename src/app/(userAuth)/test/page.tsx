"use client"
import {useSession} from "next-auth/react";

const LogIn = () => {
    const {data :session , status} = useSession();
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
        </div>
    );
}


export default LogIn;
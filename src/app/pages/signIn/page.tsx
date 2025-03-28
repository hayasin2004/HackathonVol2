"use client"
import React, {useState} from 'react';
import {signIn} from "@/repository/authRepository";
import {useRouter} from "next/navigation"
const SignIn = () => {
    const [email, setEmail] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const router = useRouter()
    const handleSignIn = async (e :  React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        const response = await  signIn(email, username, password)
        if (response.status === 200) {
            window.alert("成功")
            router.push("/")
        }
    }
    return (
        <div>
            <form action="">

            <h1>新規登録</h1>
            <br/>
            <label htmlFor="email">メールアドレス</label>
            <input name={"email"} type="email"  required onChange={(e) => setEmail(e.target.value)} />
            <br/>
            <label htmlFor="username">ユーザー名</label>
            <input name={"username"} type="text" required onChange={(e) => setUsername(e.target.value)} />
            <br/>
            <label htmlFor="password">パスワード</label>
            <input name={"password"} type="password" required onChange={(e) => setPassword(e.target.value)} />
            <button type={"submit"} onClick={handleSignIn}>送信</button>
            </form>
        </div>
    );
}


export default SignIn;
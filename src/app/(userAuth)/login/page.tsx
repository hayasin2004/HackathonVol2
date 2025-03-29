"use client"
import React, {useState} from 'react';
import {useRouter} from "next/navigation"
import {signIn} from "next-auth/react";

const LogIn = () => {
    const router = useRouter()
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const handleSignIn = async (e :  React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        const result = await signIn("credentials" , {email, password,redirect:false})
        console.log(result)
        if (result?.error) {
            window.alert(result?.error)
        }else {
            router.push("/test")
        }
    }
    return (
        <div>
            <form action="">

                <h1>ログイン</h1>
                <br/>
                <label htmlFor="email">メールアドレス</label>
                <input name={"email"} type="email" required onChange={(e) => setEmail(e.target.value)}/>
                <br/>
                <label htmlFor="password">パスワード</label>
                <input name={"password"} type="password" required onChange={(e) => setPassword(e.target.value)}/>
                <button type={"submit"} onClick={handleSignIn}>送信</button>
            </form>
        </div>
    );
}


export default LogIn;
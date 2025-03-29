"use client"
import React, {useState} from 'react';
import {updateUserRepository} from "@/repository/prisma/updateUserRepository";
import {router} from "next/client";


const updateUser = () => {
    const [email, setEmail] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const handleUpdateUser = async (e :  React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        const response = await  updateUserRepository(email, username, password)
        console.log(response)
        router.push("/")
    }
    return (
        <div>
            <form>
                <h1>情報変更</h1>
                <br/>
                <label htmlFor="email">メールアドレス</label>
                <input name={"email"} type="email" required onChange={(e) => setEmail(e.target.value)}/>
                <br />
                <label htmlFor="username">ユーザー名</label>
                <input name={"username"} type="username" required onChange={(e) => setUsername(e.target.value)}/>
                <br/>
                <label htmlFor="password">パスワード</label>
                <input name={"password"} type="password" required onChange={(e) => setPassword(e.target.value)}/>
                <button type={"submit"} onClick={handleUpdateUser}>送信</button>
            </form>
        </div>
    );
};

export default updateUser();
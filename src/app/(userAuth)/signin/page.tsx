"use client"
import React, {useState} from 'react';
import styles from  './page.module.css'
import {signIn} from "@/repository/prisma/authRepository";


const SignIn = () => {
    const [email, setEmail] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const handleSignIn = async (e :  React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        const response = await  signIn(email, username, password)
        console.log(response)
    }
    return (
        <div className={styles.outercontainer} style={{ backgroundImage: "url('/haikeiimages.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }}>

            <form  action="">
                <div className={styles.innercontainer}>
                    <h1 className={styles.h1}>新規登録</h1>
                    <br/>
                    <label htmlFor="email" className={styles.label}>メールアドレス</label>
                    <br/>
                    <input name={"email"} type="email" className={styles.input }  required onChange={(e) => setEmail(e.target.value)}/>
                    <br/>
                    <label htmlFor="username" className={styles.label}>ユーザー名</label>
                    <br/>
                    <input name={"username"} type="text" className={styles.input } required onChange={(e) => setUsername(e.target.value)}/>
                    <br/>
                    <label htmlFor="password" className={styles.label}>パスワード</label>
                    <br/>
                    <input name={"password"} type="password"  className={styles.input } required onChange={(e) => setPassword(e.target.value)}/>
                    <br/>
                    <button type={"submit"} className={styles.button} onClick={handleSignIn}>送信</button>
                </div>
            </form>

        </div>
    );
}


export default SignIn;
"use client"
import React, {useState} from 'react';
import {updateUserRepository} from "@/repository/prisma/updateUserRepository";
import {useRouter} from "next/navigation";
import {propsPlayerType} from "@/types/Player";
import userUpdateProfileValidator from "@/validator/userUpdateProfileValidator";
import styles from "@/app/(userAuth)/signin/page.module.css";


const UpdateUser: React.FC<propsPlayerType> = (props) => {
    const router = useRouter();
    // デバッグ用
    // console.log(props)
    // console.log(props?.detailPlayer?.username)
    // console.log(props?.detailPlayer?.id)

    ///
    const changeTypeId = Number(props?.detailPlayer?.id)
    const [email, setEmail] = useState<string | undefined>(props?.detailPlayer?.email)
    const [username, setUsername] = useState<string | undefined>(props?.detailPlayer?.username)
    const [password, setPassword] = useState<string | undefined>(props?.detailPlayer?.password)
    const [description, setDescription] = useState<string | undefined | null>(props?.detailPlayer?.description)

    // デバック
    console.log("email" + email, "username" + username, "password" + password, "description" + description)
    //

    const validatorUserData = {
        propsData : props ,
        email : email ,
        username : username ,
        description : description ,
        password : password ,
        setEmail : setEmail,
        setUsername : setUsername,
        setPassword : setPassword,
        setDescription : setDescription
    }

    // バリデーション処理をサーバ側で行う
    userUpdateProfileValidator(validatorUserData)
    // if (username == ""){
    //     console.log("からだよ")
    //     setUsername(props.detailPlayer?.username)
    // }
    const handleUpdateUser = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        const response = await updateUserRepository(
            changeTypeId, email, username, description, password
        )
        console.log(response)
        await router.push("/allplayer")
    }

    return (
        <div  className={styles.outercontainer} style={{ backgroundImage: "url('/haikeiimages.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }}>
            <form>
                <div className={styles.innercontainer}>
                    <h1 className={styles.h1}>情報変更</h1>
                    <br/>
                    <label htmlFor="email" className={styles.label}>メールアドレス</label>
                    <input name={"email"} type="email" className={styles.input }  required onChange={(e) => setEmail(e.target.value)}/>
                    <br/>
                    <label htmlFor="username" className={styles.label}>ユーザー名</label>
                    <input name={"username"} type="text" className={styles.input }  required onChange={(e) => setUsername(e.target.value)}/>
                    <br/>
                    <label htmlFor={"description"} className={styles.label}>自己紹介</label>
                    <input name={"description"} type="text" className={styles.input }  required onChange={(e) => setDescription(e.target.value)}/>
                    <br/>
                    <label htmlFor="password" className={styles.label}>パスワード</label>
                    <input name={"password"} type="password" className={styles.input }  required onChange={(e) => setPassword(e.target.value)}/>
                    <br/>
                    <button type={"submit"} className={styles.button} onClick={handleUpdateUser}>送信</button>
                </div>
            </form>
        </div>
    );
};

export default UpdateUser;
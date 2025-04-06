"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./page.module.css";
const LogIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const handleSignIn = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log(result);
    if (result?.error) {
      window.alert(result?.error);
    } else {
      router.push("/createKonva");
    }
  };

  const handleTouroku = () => {
    router.push("/signin");
  };
  return (
    <div
      className={styles.outercontainer}
      style={{
        backgroundImage: "url('/canvayoru.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form action="">
        <div className={styles.innercontainer}>
          <h1 className={styles.h1}>ログイン</h1>
          <br />
          <label htmlFor="email" className={styles.label}>
            メールアドレス
          </label>
          <input
            name={"email"}
            type="email"
            className={styles.input}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <label htmlFor="password" className={styles.label}>
            パスワード
          </label>
          <input
            name={"password"}
            className={styles.input}
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type={"submit"}
            className={styles.button}
            onClick={handleSignIn}
          >
            送信
          </button>
          <button
            type={"submit"}
            className={styles.button2}
            onClick={handleTouroku}
          >
            新規登録
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogIn;

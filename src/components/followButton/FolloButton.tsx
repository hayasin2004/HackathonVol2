"use client"
import React from 'react';
import {following} from "@/repository/prisma/userfollowRepository";
import {useSession} from "next-auth/react";
import {propsPlayerType} from "@/types/Player";

const FollowButton:React.FC<propsPlayerType | null> = (props) => {
    const {data: session} = useSession();
    console.log("session"+JSON.stringify(session));
    console.log("props"+JSON.stringify(props));
    return (
        <button onClick={() => {following(session?.user.id , props)}}>
            フォローする
        </button>
    );
}


export default FollowButton;
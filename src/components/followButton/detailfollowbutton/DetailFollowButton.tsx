"use client"
import React from 'react';
import {useSession} from "next-auth/react";
import {propsPlayerDetailFollowType} from "@/types/Player";
import {following} from "@/repository/prisma/userfollowRepository";

const DetailFollowButton:React.FC<propsPlayerDetailFollowType | null> = (props) =>{
    const {data: session} = useSession();
    console.log("Detail session"+JSON.stringify(session));
    console.log("Detail props"+JSON.stringify(props));

    const dataTypeChange = {
        detailPlayer : {
            id : props?.detailPlayer?.followings.id
        }
    }

    return (
        <button onClick={() => {following(session?.user.id , dataTypeChange)}}>
            フォロー解除する
        </button>
    );
}


export default DetailFollowButton;
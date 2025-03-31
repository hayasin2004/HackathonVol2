"use server"
import React from 'react';
import {getServerSession} from "next-auth";
import SelectParts from "@/components/selectParts/SelectParts";
import {authOptions} from "@/auth";

const CreateKonva = async () => {
    const session = await getServerSession(authOptions)
    console.log(session)

    return (
        <div>
            <h1>ここでKonvaの新しい画像を保存できます。</h1>
            <SelectParts session={session?.user.id}/>
        </div>
    );
}


export default CreateKonva;
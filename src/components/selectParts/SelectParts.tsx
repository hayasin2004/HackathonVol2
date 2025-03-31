"use client"
import React, {useState} from 'react';
import {konvaRepository} from "@/repository/prisma/KonvaRepository";
import {useRouter} from "next/navigation"


const SelectParts:React.FC<{session : number | undefined}> = (props) => {
    const router = useRouter()
    const [selectedValue, setSelectedValue] = useState("")
    const userId = props
    console.log(selectedValue)

    const handleChange = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value); // 選択された値を状態に保存
    };


    const handleKonvaImageChoice = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const result = await  konvaRepository(userId?.session , selectedValue)
        if(result.status == "error"){
            window.alert(result.message)
        }
        else if (result.status == "success"){
            router.push("/")
        }
    }
    return (
        <>
            <h1>ここで部品選択してね</h1>
            <form>
                <select name="selectImage" id="konvaImage" onChange={handleChange}>
                    <option value={""}>選択肢</option>
                    <option value={"circle"}>丸</option>
                    <option value={"triangle"}>三角形</option>
                    <option value={"square"}>四角系</option>
                </select>
                <button onClick={(e) => handleKonvaImageChoice(e)}>送信</button>
            </form>
        </>
    );
}


export default SelectParts;
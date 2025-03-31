"use client"
import React, {useState} from 'react';
import {CharacterPartsType} from "@/types/character";
import {Circle, Layer, Stage} from "react-konva";

const UserControllerKonva:React.FC<CharacterPartsType> = (props) => {
    const [position, setPosition] = useState({x : 100 , y : 100})
    const parts = props.character?.parts
    return (
        <div>
            <h1>ここで実際に操作をする</h1>
            <Stage
                width={typeof window !== "undefined" ? window.innerWidth : 0}
                height={typeof window !== "undefined" ? window.innerHeight : 0}
            >
                <Layer>
                    <Circle {...parts}></Circle>
                </Layer>
            </Stage>
        </div>
    );
}


export default UserControllerKonva;
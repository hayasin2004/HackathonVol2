"use client"
import React from 'react';
import {playerCoordinate} from "@/repository/prisma/ClientItemRepository";
import {PlayerCoordinateProps} from "@/types/character";

const playerPlaceSaveButton:React.FC<PlayerCoordinateProps> = (props) => {

    const handlePlayerPlace = () =>  {
        const playerPlaceData = async () => {
            const playerPlace = {userId : props.userId,x:props.x,y:props.y}
            const playerData = await playerCoordinate(playerPlace)
            return (playerData)
        }
        playerPlaceData()
    }
    return (
        <div>
            <button type={"submit"} onClick={handlePlayerPlace}>保存</button>
        </div>
    );
}


export default playerPlaceSaveButton;
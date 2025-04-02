import React from 'react';
import {playerCoordinate, PlayerCoordinateProps} from "@/repository/prisma/ClientItemRepository";

const PlayerPlaceSaveButton :React.FC<PlayerCoordinateProps> = (props) => {
    const handlePlayerPlace = () =>  {
        const playerPlaceData = async () => {
            const playerPlace = {userId : props.userId,x:props.x,y:props.y}
            const playerData = await playerCoordinate(playerPlace)

            return (playerData)
        }
        console.log(playerPlaceData)
    }
    return (
        <div>
            <button type={"submit"} onClick={handlePlayerPlace}>保存</button>
        </div>
    );
}


export default PlayerPlaceSaveButton;
"use client";

import React, {useState, useEffect} from "react";
import Grassmap from "./(konva)/grassmap/Grassmap"
import Desertmap from "./(konva)/desertmap/Desertmap";
import {PlayerItem} from "@/types/playerItem"
import {defaultItem} from "@/types/defaultItem"

interface MapDisplayProps {
    playerId: PlayerItem;
    itemData: defaultItem[];
    roomId: number;
}

const MapDisplay: React.FC<MapDisplayProps> = ({playerId, itemData, roomId}) => {
    const [isDesert, setIsDesert] = useState(false);

    const switchMap = () => {
        setIsDesert(!isDesert)
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") {
                switchMap();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isDesert]);

    return (
        <div>
            <button onChange={switchMap}>マップ切り替え</button>
            {isDesert ? (<Desertmap playerId={playerId} itemData={itemData} roomId={roomId}/>) : (<Grassmap playerId={playerId} itemData={itemData} roomId={roomId}/>)}
        </div>
    );
};

export default MapDisplay;
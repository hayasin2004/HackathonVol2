"use client";
import React, { useState, useEffect } from "react";
import Grassmap from "./(konva)/grassmap/Grassmap"
import Desertmap from "./(konva)/desertmap/Desertmap"
//ほかにもインポートしたかったらここに追加。

import { PlayerItem } from "@/types/playerItem"
import { defaultItem } from "@/types/defaultItem";
import useRemakeItemGet from "@/hooks/(realTime)/test/useRemakeItemGet";

interface MapDisplayProps {
    playerId: PlayerItem;
    itemData: defaultItem[];
    roomId: number;
}

const TILE_SIZE = 64;
const MAP_WIDTH = 64 * TILE_SIZE;
const MAP_HEIGHT = 64 * TILE_SIZE;

const MapDisplay: React.FC<MapDisplayProps> = ({ playerId, itemData, roomId }) => {
    const [mapStatus, setMapStatus] = useState(1);
    const {ECollisionPosition,} = useRemakeItemGet({userId: playerId.userId, initialPosition: { x: playerId.x, y: playerId.y }, itemData, mapWidthInPixels: MAP_WIDTH, mapHeightInPixels: MAP_HEIGHT,});
    // const {ECollisionPosition,} = useRemakeItemGet({userId: playerId.userId, initialPosition: { x:0, y:0 }, itemData, mapWidthInPixels: MAP_WIDTH, mapHeightInPixels: MAP_HEIGHT,});

    //マップの端に来たら切り替え処理
    useEffect (() => {
        const atRightEdge = ECollisionPosition.x >= MAP_WIDTH - TILE_SIZE;
        const atLeftEdge = ECollisionPosition.x <= 0;
        //上に行った際の処理
        // const atTopEdge = ECollisonPosition.y <= 0;
        //下に行った際の処理
        //const adBottomEdge = ECollisionPosition.y >= MAP_HEIGHT - TILE_SIZE;

        switch (mapStatus) {
            case 1: //草原
                if (atRightEdge) setMapStatus(2);//右押した際に砂漠に行きます
                break;
            case 2: //砂漠
                if (atLeftEdge) setMapStatus(1);
                break;
            //マップを増やす場合はcaseを増やして
            
            default:
                break;
        }
    }, [ECollisionPosition, mapStatus]);

    const renderMap = () => {
        switch (mapStatus) {
            case 1:
                return <Grassmap playerId={playerId} itemData={itemData} roomId={roomId} />
            case 2:
                return <Desertmap playerId={playerId} itemData={itemData} roomId={roomId} />
            //増やす場合はケースを増やして

            default:
                return null;
        }
    };

    return <div>{renderMap()}</div>;
}

export default MapDisplay;
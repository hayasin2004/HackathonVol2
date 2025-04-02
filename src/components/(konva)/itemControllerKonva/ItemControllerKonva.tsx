"use client"
import React, {useState} from 'react';
import {CharacterPartsType} from "@/types/character";
import {Circle, Layer, Rect, Stage} from "react-konva";
import useGetItem from "@/hooks/(animation)/getItem/useGetItem";
import PlayerPlaceSaveButton from "@/components/playerPlaceSaveButton/page";
import {craftItem} from "@/repository/prisma/test/testRepositoy";
import {successCraftItem, successPlayerData} from "@/repository/prisma/test/dummyData";

const ItemControllerKonva: React.FC<CharacterPartsType> = (props) => {
    // const rectPositions = [
    //     {id: "rect1", x: 150, y: 100, width: 100, height: 50, fill: "blue"},
    //     {id: "rect2", x: 300, y: 200, width: 120, height: 80, fill: "green"},
    //     {id: "rect3", x: 500, y: 300, width: 150, height: 100, fill: "orange"},
    // ];
    // 初回レンダリング時にランダム座標を設定
    const generateRandomCoordinates = (maxWidth: number, maxHeight: number): { x: number; y: number } => {
        return {
            x: Math.floor(Math.random() * maxWidth),
            y: Math.floor(Math.random() * maxHeight),
        };
    };
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    const screenHeight = typeof window !== "undefined" ? window.innerHeight : 0;

    const itemArray = props.itemArray ?? [];
    const [itemsWithCoordinates, setItemsWithCoordinates] = useState(() =>
        itemArray?.map((item) => {
            const {x, y} = generateRandomCoordinates(screenWidth, screenHeight);
            return {...item, x, y};
        })
    );
    const circleRadius = 30;
    const userId = props.character?.userId
    const {ECollisionPosition, ECollisionStatus, adjacentObstacles, adjacentObstaclesStatus} = useGetItem(
        userId,
        {x: props?.playerData?.x, y: props?.playerData?.y},
        circleRadius,
        itemsWithCoordinates
    );

    console.log(adjacentObstacles)

    const testCraft = async () => {
        const result = await craftItem(successPlayerData.id, successCraftItem.createdItemId)
        console.log(result)
    }

    return (
        <>
            {/* 隣接している障害物を表示 */}
            <div>
                <h2>隣接している障害物</h2>
                <button onClick={testCraft}>テスト</button>
                {/*<PlayerPlaceSaveButton userId={userId} x={ECollisionPosition.x} y={ECollisionPosition.y}/>*/}

                {adjacentObstaclesStatus == "" ? (
                        adjacentObstacles?.map((obstacle) => (
                            <div key={obstacle.id}>
                                <p>
                                    障害物ID: {obstacle.itemName}
                                </p>
                            </div>
                        ))
                    ) :
                    <div>
                        <p style={{opacity: "0"}}>aaa</p>
                    </div>
                }
            </div>
            <Stage
                width={typeof window !== "undefined" ? window.innerWidth : 0}
                height={typeof window !== "undefined" ? window.innerHeight : 0}
            >
                <Layer>
                    {/* 円 */}
                    <Circle
                        x={ECollisionPosition.x}
                        y={ECollisionPosition.y}
                        radius={circleRadius}
                        fill={ECollisionStatus ? "#ecee33" : "#1c027f"}
                    />

                    {/* 障害物 */}
                    {itemsWithCoordinates?.map((rect, index) => (
                        <Rect
                            key={rect.id}
                            x={rect.x}
                            y={rect.y}
                            width={100}
                            height={100}
                            fill={"red"}
                        />
                    ))}
                </Layer>
            </Stage>

        </>
    );

}


export default ItemControllerKonva;
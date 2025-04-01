"use client"
import React from 'react';
import {CharacterPartsType} from "@/types/character";
import {Circle, Layer, Rect, Stage} from "react-konva";
import useEventHappen from "@/hooks/(animation)/eventHappen/useEventHappen";
import useGetItem from "@/hooks/(animation)/getItem/useGetItem";

const ItemControllerKonva: React.FC<CharacterPartsType> = (props) => {
    // const rectPositions = [
    //     {id: "rect1", x: 150, y: 100, width: 100, height: 50, fill: "blue"},
    //     {id: "rect2", x: 300, y: 200, width: 120, height: 80, fill: "green"},
    //     {id: "rect3", x: 500, y: 300, width: 150, height: 100, fill: "orange"},
    // ];
    const itemArray = props.itemArray
    console.log(itemArray)
    const circleRadius = 30;
    const {ECollisionPosition, ECollisionStatus, adjacentObstacles, adjacentObstaclesStatus} = useGetItem(
        {x: 100, y: 100},
        circleRadius,
        itemArray
    );

    return (
        <>
            {/* 隣接している障害物を表示 */}
            <div>
                <h2>隣接している障害物</h2>
                {adjacentObstaclesStatus == "" ? (
                        adjacentObstacles.map((obstacle) => (
                            <div key={obstacle.id}>
                                <p>
                                    障害物ID: {obstacle.itemName}
                                </p>
                            </div>
                        ))
                    ) :
                    <div>
                        <p style={{opacity : "0"}}>aaa</p>
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
                    {itemArray?.map((rect , index) => (
                        <Rect
                            key={rect.id}
                            x={rect.x}
                            y={rect.y}
                            width={rect.width}
                            height={rect.height}
                            fill={"red"}
                        />
                    ))}
                </Layer>
            </Stage>

        </>
    );

}


export default ItemControllerKonva;
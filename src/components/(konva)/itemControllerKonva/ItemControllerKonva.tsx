"use client";
import React, {useState, useEffect} from "react";
import {CharacterPartsType} from "@/types/character";
import {Circle, Layer, Rect, Stage, Image as KonvaImage} from "react-konva";
import useGetItem from "@/hooks/(animation)/getItem/useGetItem";
import {craftItem} from "@/repository/prisma/test/testRepositoy";

const ItemControllerKonva: React.FC<CharacterPartsType> = (props) => {
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
        itemArray.map((item) => {
            const {x, y} = generateRandomCoordinates(screenWidth, screenHeight);
            return {...item, x, y};
        })
    );

    const [loadedImages, setLoadedImages] = useState<Record<number, HTMLImageElement>>({});

    useEffect(() => {
        const loadImages = () => {
            const images: Record<number, HTMLImageElement> = {};
            itemsWithCoordinates.forEach((item) => {
                if (item.itemIcon) {
                    const img = new window.Image();
                    img.src = item.itemIcon; // Load image from URL
                    img.onload = () => {
                        images[item.id] = img;
                        setLoadedImages((prev) => ({...prev, [item.id]: img})); // Update state
                    };
                }
            });
        };
        loadImages();
    }, [itemsWithCoordinates]);

    const circleRadius = 30;
    const userId = props.character?.userId;
    const {ECollisionPosition, ECollisionStatus, adjacentObstacles, adjacentObstaclesStatus} = useGetItem(
        userId,
        {x: props?.playerData?.x, y: props?.playerData?.y},
        circleRadius,
        itemsWithCoordinates
    );

    const testCraft = async (craftItemId : number) => {
        const result = await craftItem(userId,craftItemId);
        console.log(result);
    };

    return (
        <>
            {/* 隣接している障害物を表示 */}
                <div>
                    <h2>隣接している障害物</h2>
                    <button onClick={testCraft}>テスト</button>
                    {adjacentObstaclesStatus === "" ? (
                        adjacentObstacles?.map((obstacle) => (
                            <div key={obstacle.id}>
                                <p>障害物ID: {obstacle.itemName}</p>
                            </div>
                        ))
                    ) : (
                        <div>
                            <p style={{opacity: "0"}}>aaa</p>
                        </div>
                    )}
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
                        {itemsWithCoordinates?.map((rect) => (
                            <Rect
                                key={rect.id}
                                x={rect.x}
                                y={rect.y}
                                width={100}
                                height={100}
                                fill={"red"}
                            />
                        ))}
                        {itemsWithCoordinates.map((rect) => (
                            <KonvaImage
                                key={rect.id}
                                x={rect.x}
                                y={rect.y}
                                width={100}
                                height={100}
                                image={loadedImages[rect.id]} // Pass the loaded image
                            />
                        ))}
                    </Layer>
                </Stage>
        </>
    );
};

export default ItemControllerKonva;
import React, {useState, useEffect} from "react";

import useGenerateMap from "@/hooks/(realTime)/2D/2DMap/firstMapGenerateTile/useGenerateMap";
import {PlayerItem} from "@/types/playerItem";
import {Map_data, Tile_size} from "@/components/(konva)/grassmap/mapData";
import useCameraPosition from "@/hooks/(realTime)/2D/2Dcamera/initialCameraPosition/useCameraPosition";
import {Stage, Layer, Rect, Image as KonvaImage} from "react-konva";

interface mapVolOneTypes {
    playerId: PlayerItem
    ECollisionPosition: { x: number, y: number }
    playerCharacter: HTMLImageElement | null
}

const MapVolOne: React.FC<mapVolOneTypes> = ({playerId, ECollisionPosition ,playerCharacter}) => {


    const {tileImagesComplete, isLoading} = useGenerateMap()
    const [tileImages, setTileImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [isDark, setIsDark] = useState(false);
    const [cameraPosition, setCameraPosition] = useState({x: 0, y: 0});


    const cameraPositionHook = useCameraPosition(
        ECollisionPosition.x,
        ECollisionPosition.y
    );
    useEffect(() => {
        // cameraPositionの変更を検知して状態を更新
        setCameraPosition(cameraPositionHook);
    }, [cameraPosition, ECollisionPosition]);


    useEffect(() => {
        setTileImages(tileImagesComplete)
    }, [tileImagesComplete, isLoading]);

    useEffect(() => {


        // 20パーの確立でマップを暗くする
        const shouldBeDark = Math.random() < 0.2; // 20%の確率
        setIsDark(shouldBeDark);
    }, [playerId]);

    return (
        <div>
            <Stage
                width={typeof window !== "undefined" ? window.innerWidth : 0}
                height={typeof window !== "undefined" ? window.innerHeight : 0}
            >
                <Layer>
                    {/* --- 1. Grass背景 --- */}
                    {Map_data.map((row, rowIndex) =>
                        row.map((_, colIndex) => {
                            const grassImg = tileImages["grass"];
                            if (!grassImg) return null;
                            return (
                                <KonvaImage
                                    key={`grass-${rowIndex}-${colIndex}`}
                                    image={grassImg}
                                    x={colIndex * Tile_size - cameraPosition.x}
                                    y={rowIndex * Tile_size - cameraPosition.y}
                                    width={Tile_size}
                                    height={Tile_size}
                                    alt="タイル画像"
                                />
                            );
                        })
                    )}
                    {/* --- 2. その他のタイル --- */}
                    {tileImages && (Map_data.map((row, rowIndex) =>
                        row.map((tile, colIndex) => {
                            if (tile === "grass") return null;
                            const img = tileImages[tile];
                            if (!img) return null;
                            const isLargeTile = tile === "tree" || tile === "stone" || tile === "iron" || tile === "coal";
                            if (isLargeTile) {
                                const isRightNeighborSame = Map_data[rowIndex]?.[colIndex - 1] === tile;
                                const isBottomNeighborSame = Map_data[rowIndex - 1]?.[colIndex] === tile;
                                const isBottomRightSame = Map_data[rowIndex - 1]?.[colIndex - 1] === tile;
                                if (isRightNeighborSame || isBottomNeighborSame || isBottomRightSame) {
                                    return null;
                                }

                                // キー押されたら
                                const handleTileClick() => {
                                    
                                }
                                // const test = async () =>{
                                // const getItemId = `${tile}-${rowIndex}-${colIndex}`
                                //     const spofhszhfld = await catchItem(getItemId , playerId)
                                //     if (spofhszhfld){
                                //         if (${tile}-${rowIndex}-${colIndex} == データベースカラ返ってきた${tile}-${rowIndex}-${colIndex}){
                                //             ${tile}-${rowIndex}-${colIndex}は消える
                                //         }
                                //
                                //     }
                                // }
                                console.log(`${tile}-${rowIndex}-${colIndex}`)
                                return (
                                    <KonvaImage
                                        key={`${tile}-${rowIndex}-${colIndex}`}
                                        image={img}
                                        x={colIndex * Tile_size - cameraPosition.x}
                                        y={rowIndex * Tile_size - cameraPosition.y}
                                        width={Tile_size * 2}
                                        height={Tile_size * 2}
                                        alt="タイル画像"
                                    />
                                );
                            }
                            return (
                                <KonvaImage
                                    key={`${tile}-${rowIndex}-${colIndex}`}
                                    image={img}
                                    x={colIndex * Tile_size - cameraPosition.x}
                                    y={rowIndex * Tile_size - cameraPosition.y}
                                    width={Tile_size}
                                    height={Tile_size}
                                    alt="タイル画像"
                                />
                            );
                        })
                    ))}
                    {/*{itemData.map((data) => (*/}
                    {/*    <KonvaImage*/}
                    {/*        key={data.id} // _uniqueId を key に使う（id 重複を避ける）*/}
                    {/*        x={data.x! - cameraPosition.x}*/}
                    {/*        y={data.y! - cameraPosition.y}*/}
                    {/*        width={Tile_size}*/}
                    {/*        height={Tile_size}*/}
                    {/*        image={loadedImages[data.id]} // data.id で元の画像を参照*/}
                    {/*    />*/}
                    {/*))}*/}

                    {/* --- プレイヤー --- */}
                    {playerCharacter && (
                        <KonvaImage
                            image={playerCharacter}
                            x={ECollisionPosition?.x - cameraPosition.x}
                            y={ECollisionPosition?.y - cameraPosition.y}
                            width={Tile_size}
                            height={Tile_size}
                            alt="プレイヤー写真"
                        />
                    )}
                    {isDark && (
                        <Rect
                            x={0}
                            y={0}
                            width={typeof window !== "undefined" ? window.innerWidth : 0}
                            height={typeof window !== "undefined" ? window.innerHeight : 0}
                            fill="black"
                            opacity={0.7}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
}


export default MapVolOne;
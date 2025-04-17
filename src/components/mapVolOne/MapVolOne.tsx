import React, {useState, useEffect, useRef} from "react";

import useGenerateMap from "@/hooks/(realTime)/2D/2DMap/firstMapGenerateTile/useGenerateMap";
import {PlayerItem} from "@/types/playerItem";
import {Map_data, Tile_size} from "@/components/(konva)/grassmap/mapData";
import useCameraPosition from "@/hooks/(realTime)/2D/2Dcamera/initialCameraPosition/useCameraPosition";
import {Stage, Layer, Rect, Image as KonvaImage} from "react-konva";
import {objectItemIconImage} from "@/hooks/(realTime)/test/useRemakeItemGet";

interface mapVolOneTypes {
    playerId: PlayerItem
    ECollisionPosition: { x: number, y: number }
    playerCharacter: HTMLImageElement | null
    objectItemImage: objectItemIconImage[] | null
}

const MapVolOne: React.FC<mapVolOneTypes> = ({
                                                 playerId,
                                                 ECollisionPosition,
                                                 playerCharacter,
                                                 objectItemImage
                                             }) => {


    const {tileImagesComplete, isLoading} = useGenerateMap()
    const [tileImages, setTileImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [isDark, setIsDark] = useState(false);
    const [cameraPosition, setCameraPosition] = useState({x: 0, y: 0});
    const [mapData, setMapData] = useState(Map_data);
    const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});

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


    // 画像の参照を保持するための useRef

    useEffect(() => {
        // アイテムごとに画像をプリロード
        objectItemImage?.forEach((item) => {
            if (!imagesRef.current[item.id]) {
                const img = new Image();
                img.src = item.iconImage; // 各アイテムの画像URL
                img.onload = () => {
                    imagesRef.current[item.id] = img; // ロードした画像を参照に保存
                };
            }
        });
    }, [objectItemImage]);


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
                    {tileImages &&
                        Map_data.map((row, rowIndex) =>
                            row.map((tile, colIndex) => {
                                // tileId を生成
                                if (!tile || rowIndex === undefined || colIndex === undefined) {
                                    console.error("必要なデータが未定義です: tile, rowIndex, colIndex");
                                    return null;
                                }

                                const tileId = `${tile}-${rowIndex}-${colIndex}`;

                                // eCollisionGotItemStatus の id と tileId を比較し、一致すれば除外

                                const img = tileImages[tile];
                                if (!img) return null;

                                const isLargeTile = ["tree", "stone", "iron", "coal"].includes(tile);
                                if (isLargeTile) {
                                    const isRightNeighborSame = Map_data[rowIndex]?.[colIndex - 1] === tile;
                                    const isBottomNeighborSame = Map_data[rowIndex - 1]?.[colIndex] === tile;
                                    const isBottomRightSame = Map_data[rowIndex - 1]?.[colIndex - 1] === tile;
                                    if (isRightNeighborSame || isBottomNeighborSame || isBottomRightSame) return null;

                                    const handleTileClick = async () => {
                                        const itemId = `${tile}-${rowIndex}-${colIndex}`;
                                        // アイテム取得処理
                                        // 例: await catchItem(itemId, playerId);
                                    };
                                }

                                return (
                                    <KonvaImage
                                        key={tileId}
                                        image={img}
                                        x={colIndex * Tile_size - cameraPosition.x}
                                        y={rowIndex * Tile_size - cameraPosition.y}
                                        width={Tile_size}
                                        height={Tile_size}
                                        alt="タイル画像"
                                    />
                                );
                            })
                        )}

                    {/* --- プレイヤー --- */}
                    {objectItemImage?.map((item) => {
                        const img = imagesRef.current[item.id];
                        return (
                            img && (
                                <KonvaImage
                                    key={item.id}
                                    image={img} // プリロードされた HTMLImageElement を渡す
                                    x={item.x - cameraPosition.x}
                                    y={item.y - cameraPosition.y}
                                    width={64}
                                    height={64}
                                    alt="タイル画像"
                                />
                            )
                        );
                    })}
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
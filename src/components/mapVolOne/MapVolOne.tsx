import React, {useState, useEffect, useRef} from "react";

import useGenerateMap from "@/hooks/(realTime)/2D/2DMap/firstMapGenerateTile/useGenerateMap";
import {PlayerItem} from "@/types/playerItem";
import {Map_data, Tile_size} from "@/components/(konva)/grassmap/mapData";
import useCameraPosition from "@/hooks/(realTime)/2D/2Dcamera/initialCameraPosition/useCameraPosition";
import {Stage, Layer, Rect, Image as KonvaImage, Text} from "react-konva";
import {defaultItem} from '@/types/defaultItem';
import {objectItemIconImage} from "@/hooks/(realTime)/test/useRemakeItemGet";
import {io, Socket} from "socket.io-client";
import EnemyTest from "@/components/(konva)/enemy/EnemyTest";
import {Enemy} from "@/types/enemy";
import {GetEnemy} from "@/repository/prisma/enemy/enemyRepository";
import {NPC} from "@/types/npc";

// const socket = io('http://localhost:5000');
interface mapVolOneTypes {
    playerId: PlayerItem
    ECollisionPosition: { x: number, y: number }
    nearbyItemPosition: { x: number, y: number } | null,
    playerCharacter: HTMLImageElement | null
    objectItemImage: objectItemIconImage[] | null
    socket: Socket | null
    enemyData: Enemy[] | null
    onItemRemove?: (enemyId: string) => void
}

const MapVolOne: React.FC<mapVolOneTypes> = ({
                                                 playerId,
                                                 ECollisionPosition,
                                                 playerCharacter,
                                                 objectItemImage,
                                                 nearbyItemPosition,
                                                 enemyData,
                                                 socket,
                                                 onItemRemove
                                             }) => {


    const {tileImagesComplete, isLoading} = useGenerateMap()
    const [tileImages, setTileImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [isDark, setIsDark] = useState(false);
    const [cameraPosition, setCameraPosition] = useState({x: 0, y: 0});
    const [mapData, setMapData] = useState(Map_data);
    const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
    const [items, setItems] = useState<objectItemIconImage[] | null>(objectItemImage);
    const [DeleteItems, setDeleteItems] = useState<objectItemIconImage[] | null>(objectItemImage);
    // アイテムの画像がロード完了したかを追跡するための状態
    const [loadedImages, setLoadedImages] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        console.log("items" + JSON.stringify(items))
    }, [items]); // itemsが変更されたときに実行されるように修正

    // map上からItemを削除する
    useEffect(() => {
        if (!socket) return;

        const handleItemRemoved = (itemId) => {
            console.log('マップ上から削除:', itemId);
            setItems(prevItems => {
                if (!prevItems) return null;
                return prevItems.filter(item => item.id !== itemId);
            });
        };

        socket.on('itemRemoved', handleItemRemoved);

        return () => {
            socket.off('itemRemoved', handleItemRemoved);
        };
    }, [socket]);



    useEffect(() => {
        if (!socket) return;

        const handleItemPlaced = (itemData) => {
            console.log('New item placed:', itemData);

            // 新しいアイテムの画像をプリロード
            const img = new Image();
            img.src = itemData.iconImage;

            img.onload = () => {
                console.log('Image loaded for item:', itemData.id);
                // 画像がロードされたら、参照を保存してからアイテムを追加
                imagesRef.current[itemData.id] = img;
                setLoadedImages(prev => ({...prev, [itemData.id]: true}));

                // 既存のアイテムリストに新しいアイテムを追加
                setItems(prevItems => {
                    // 既存のアイテムがない場合は新しい配列を作成
                    if (!prevItems) return [itemData];

                    // 同じIDのアイテムが既に存在するか確認
                    const existingIndex = prevItems.findIndex(item => item.id === itemData.id);
                    if (existingIndex >= 0) {
                        // 既存のアイテムを更新
                        const updatedItems = [...prevItems];
                        updatedItems[existingIndex] = itemData;
                        console.log('Updated existing item:', itemData);
                        return updatedItems;
                    } else {
                        // 新しいアイテムを追加
                        console.log('Added new item:', itemData);
                        return [...prevItems, itemData];
                    }
                });
            };

            img.onerror = () => {
                console.error('Failed to load image for item:', itemData.id, itemData.iconImage);
            };
        };

        socket.on('itemPlaced', handleItemPlaced);

        return () => {
            socket.off('itemPlaced', handleItemPlaced);
        };
    }, [socket]);


    const handleItemDelete = (itemId: string) => {
        console.log("delete", itemId);
        setItems(prevItems =>
            prevItems ? prevItems.filter(item => item.id !== itemId) : null
        );
    }

    useEffect(() => {
        setItems(objectItemImage);
    }, [objectItemImage]);

    const cameraPositionHook = useCameraPosition(
        ECollisionPosition.x,
        ECollisionPosition.y
    );
    useEffect(() => {
        // cameraPositionの変更を検知して状態を更新
        setCameraPosition(cameraPositionHook);
    }, [cameraPositionHook, ECollisionPosition]);


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
        if (!items) return;

        items.forEach((item) => {
            if (!imagesRef.current[item.id]) {
                const img = new Image();
                img.src = item.iconImage; // 各アイテムの画像URL
                img.onload = () => {
                    imagesRef.current[item.id] = img; // ロードした画像を参照に保存
                    setLoadedImages(prev => ({...prev, [item.id]: true}));
                };
            }
        });
    }, [items]);

    const handleStageContextMenu = (event) => {
        event.evt.preventDefault();
    };
    const [localEnemyData, setLocalEnemyData] = useState<Enemy[] | null>(enemyData);

    useEffect(() => {
        setLocalEnemyData(enemyData);
    }, [enemyData]);
    // 敵を削除する関数

    const handleRemoveEnemy = (enemyId: number) => {
        // ローカルの状態を更新
        setLocalEnemyData(prev => prev ? prev.filter(enemy => enemy.id !== enemyId) : null);
    };

    return (
        <div>
            <Stage
                width={typeof window !== "undefined" ? window.innerWidth : 0}
                height={typeof window !== "undefined" ? window.innerHeight : 0}
                onContextMenu={handleStageContextMenu}
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
                                if (!tile || rowIndex === undefined || colIndex === undefined) {
                                    console.error("必要なデータが未定義です: tile, rowIndex, colIndex");
                                    return null;
                                }

                                const tileId = `${tile}-${rowIndex}-${colIndex}`;
                                const img = tileImages[tile];
                                if (!img) return null;

                                const isLargeTile = ["tree", "stone", "iron", "coal"].includes(tile);
                                if (isLargeTile) {
                                    const isRightNeighborSame = Map_data[rowIndex]?.[colIndex - 1] === tile;
                                    const isBottomNeighborSame = Map_data[rowIndex - 1]?.[colIndex] === tile;
                                    const isBottomRightSame = Map_data[rowIndex - 1]?.[colIndex - 1] === tile;
                                    if (isRightNeighborSame || isBottomNeighborSame || isBottomRightSame) return null;
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


                    {items?.map((item, index) => {
                        // 既存の画像を使用するか、新しい画像をロード
                        const img = imagesRef.current[item.id];
                        if (!img) {
                            // 画像がまだロードされていない場合はnullを返し、レンダリングしない
                            return null;
                        }

                        return (
                            <KonvaImage
                                key={`${item.id}-${index}`} // idとindexを組み合わせて一意のキーを生成
                                image={img}
                                x={item.x - cameraPosition.x}
                                y={item.y - cameraPosition.y}
                                width={item.width}
                                height={item.height}
                                alt="タイル画像"
                                onItemRemove={handleItemDelete}
                            />
                        );
                    })}
                    {playerCharacter && (
                        <>
                            <KonvaImage
                                image={playerCharacter}
                                x={ECollisionPosition?.x - cameraPosition.x}
                                y={ECollisionPosition?.y - cameraPosition.y}
                                width={Tile_size}
                                height={Tile_size}
                                alt="プレイヤー写真"
                            />
                            <Text
                                text={`hp + ${String(playerId.hp)}`}
                                x={ECollisionPosition?.x - cameraPosition.x}
                                y={(ECollisionPosition?.y - cameraPosition.y) - 20}
                                fontSize={30}
                                fill="red"
                                align="center"
                                width={100}
                            />
                            <Text
                                text={`attack + ${String(playerId.attack)}`}
                                x={ECollisionPosition?.x - cameraPosition.x}
                                y={(ECollisionPosition?.y - cameraPosition.y) - 60}
                                fontSize={30}
                                fill="red"
                                align="center"
                                width={150}
                            />
                        </>

                    )}

                    {/* --- 黒い四角形を最後に追加 --- */}
                    {nearbyItemPosition && (
                        <Rect
                            x={nearbyItemPosition.x - cameraPosition.x}
                            y={nearbyItemPosition.y - cameraPosition.y}
                            width={64}
                            height={64}
                            fill="rgba(0, 0, 0, 0.5)" // 半透明の黒
                            listening={false} // クリックを無視
                        />
                    )}
                    {Array.isArray(localEnemyData) && localEnemyData.length > 0 && (
                        <EnemyTest
                            enemyData={localEnemyData}
                            cameraPosition={cameraPosition}
                            ECollisionPosition={ECollisionPosition}
                            onEnemyRemove={handleRemoveEnemy}
                            player={playerId}  // プレイヤー情報を渡す
                            playerAttack={playerId.attack}
                            onPlayerDamage={(newHp) => {
                                // プレイヤーのHPが更新されたときの処理
                                console.log(`プレイヤーのHPが${newHp}に更新されました`);
                                // ここで必要に応じて親コンポーネントに通知できます
                            }}
                        />
                    )}

                    {isDark && (
                        <Rect
                            x={0}
                            y={0}
                            width={typeof window !== "undefined" ? window.innerWidth : 0}
                            height={typeof window !== "undefined" ? window.innerHeight : 0}
                            fill="black"
                            opacity={0.2}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
}


export default MapVolOne;
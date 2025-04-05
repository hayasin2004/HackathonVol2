"use client";

import React, {useState, useEffect, KeyboardEvent, useMemo, useRef} from "react";
import {Stage, Layer, Rect, Image as KonvaImage} from "react-konva";
import {
    Tile_size,
    Map_width,
    Map_height,
    generateItemPositions, Map_data, Tile_list, generateMap,
} from "./mapData";
import Image from "next/image"
import {PlayerItem} from "@/types/playerItem";
import {useSocketConnection} from "@/hooks/(realTime)/connection/useScoketConnection";
import useRemakeItemGet from "@/hooks/(realTime)/test/useRemakeItemGet";
import useGetItem from "@/hooks/(animation)/getItem/useGetItem";
import {useSupabaseRealtime} from "@/hooks/(realTime)/supabaseRealTime/useSupabaseRealTime";
import {defaultItem, RandomDefaultItem, RoomDefaultItem} from "@/types/defaultItem";
import styles from './page.module.css'

// プレイヤーをTile_sizeからx: 10 y: 10のところを取得する

interface GameProps {
    playerId: PlayerItem;
    itemData: defaultItem[];
    roomId: number;
}


const MapWithCharacter: React.FC<GameProps> = ({playerId, roomId, itemData}) => {
    const {socket, connected, players, items, error, movePlayer} = useSocketConnection(playerId.id, roomId);
    const MAP_PIXEL_WIDTH = Map_width * Tile_size;
    const MAP_PIXEL_HEIGHT = Map_height * Tile_size;
    const {itemEvents, craftEvents} = useSupabaseRealtime(roomId, playerId.id);


    const [playerItems, setPlayerItems] = useState<any[]>([]);
    const [craftItems, setCraftItems] = useState<any[]>([]);


    const [notifications, setNotifications] = useState<string[]>([]);
    const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
    const [cameraPosition, setCameraPosition] = useState({x: 0, y: 0});
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [augmentedItemData, setAugmentedItemData] = useState<RoomDefaultItem[]>([]);
    const [randomPlacedItems, setRandomPlacedItems] = useState<RandomDefaultItem[]>([]);
    const [tileImages, setTileImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [playerPosition, setPlayerPosition] = useState({x: playerId.x, y: playerId.y});
    const [selectedItemId, setSelectedItemId] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // クラフトをプルダウンメニュー化
    const handleSelectChange = (e: any) => {
        setSelectedItemId(e);
    };

    const handleCraftClick = () => {
        if (selectedItemId) {
            handleCraftItem(selectedItemId);
        }
    };


    const stableInitialPosition = useMemo(() => ({
        x: playerId?.x ?? 0,
        y: playerId?.y ?? 0,
    }), [playerId?.x, playerId?.y]);

    // ----------------------------
    // マップオブジェクト関連の処理
    // ----------------------------
    const enhancedMapData = Map_data.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
            return {
                type: tile,
                rowIndex,
                colIndex,
                relatedItemId: tile === "tree" ? "wood" :
                    tile === "stone" ? "stone_material" :
                        tile === "iron" ? "iron_ore" :
                            tile === "coal" ? "coal" : null,
            };
        })
    );
    const ObjectToItemMapping = {
        tree: "wood",
        stone: "stone",
        iron: "iron",
        coal: "coal",
        flower: "flower",
        mushroom: "mushroom",
        insect: "insect",
        water: "water",
    };
    const extractInteractableObjects = (mapData: string[][]) => {
        const interactableObjects: Array<{
            id: string;
            type: string;
            x: number;
            y: number;
            width: number;
            height: number;
            isMapObject: boolean;
            relatedItemId: string;
        }> = [];
        mapData.forEach((row, rowIndex) => {
            row.forEach((tile, colIndex) => {
                const objectType = tile;
                if (objectType in ObjectToItemMapping) {
                    const isLargeObject = ["tree", "stone", "iron", "coal"].includes(objectType);
                    if (isLargeObject) {
                        const isRightNeighborSame = mapData[rowIndex]?.[colIndex - 1] === objectType;
                        const isBottomNeighborSame = mapData[rowIndex - 1]?.[colIndex] === objectType;
                        const isBottomRightSame = mapData[rowIndex - 1]?.[colIndex - 1] === objectType;
                        if (isRightNeighborSame || isBottomNeighborSame || isBottomRightSame) {
                            return;
                        }
                        interactableObjects.push({
                            id: `map-${objectType}-${rowIndex}-${colIndex}`,
                            type: objectType,
                            x: colIndex * Tile_size,
                            y: rowIndex * Tile_size,
                            width: Tile_size * 2,
                            height: Tile_size * 2,
                            isMapObject: true,
                            relatedItemId: ObjectToItemMapping[objectType as keyof typeof ObjectToItemMapping],
                        });
                    } else {
                        interactableObjects.push({
                            id: `map-${objectType}-${rowIndex}-${colIndex}`,
                            type: objectType,
                            x: colIndex * Tile_size,
                            y: rowIndex * Tile_size,
                            width: Tile_size,
                            height: Tile_size,
                            isMapObject: true,
                            relatedItemId: ObjectToItemMapping[objectType as keyof typeof ObjectToItemMapping],
                        });
                    }
                }
            });
        });
        return interactableObjects;
    };
    const interactableMapObjects = extractInteractableObjects(Map_data);

    const {
        ECollisionPosition,

    } = useRemakeItemGet({
        userId: playerId.id,
        initialPosition: {x: playerId.x ?? 0, y: playerId.y ?? 0},
        rectPositions: itemData,
        mapWidthInPixels: Map_width * Tile_size,
        mapHeightInPixels: Map_height * Tile_size,
        mapObjects: interactableMapObjects,
    });

    // ----------------------------
    // プレイヤー画像切り替え用のロジック（2枚のpngを交互に切替）
    // ----------------------------
    const lastKeyPressTimeRef = useRef<number>(0);
    const currentDirectionRef = useRef<string>("default");
    const animationIntervalRef = useRef<number | null>(null);
    const frameRef = useRef<number>(0); // 0: 静止画, 1: 歩行モーション

    const staticImages = {
        default: "/character_front.png",
        ArrowUp: "/character_back.png",
        ArrowDown: "/character_front.png",
        ArrowRight: "/character_right.png",
        ArrowLeft: "/character_left.png",
    };

    const walkImages = {
        ArrowUp: "/character_back_walk.png",
        ArrowDown: "/character_front_walk.png",
        ArrowRight: "/character_right_walk.png",
        ArrowLeft: "/character_left_walk.png",
    };

    const loadPlayerImage = (src: string) => {
        const img = new window.Image();
        img.src = src;
        console.log(img.src)
        img.onload = () => setPlayerImage(img);
    };

    useEffect(() => {
        // 初期は静止画像を表示
        loadPlayerImage(staticImages.default);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.key in staticImages)) return;
            const direction = event.key;
            const now = Date.now();
            lastKeyPressTimeRef.current = now;
            currentDirectionRef.current = direction;

            // アニメーションが開始していなければ開始
            if (animationIntervalRef.current === null) {
                frameRef.current = 0;
                // 最初は歩行モーションの画像で開始
                loadPlayerImage(walkImages[direction]);
                frameRef.current = 1; // 次は静止画へ
                animationIntervalRef.current = window.setInterval(() => {
                    const currentTime = Date.now();
                    // 500ms以内にキー入力がなければ停止して静止画像へ
                    if (currentTime - lastKeyPressTimeRef.current > 600) {
                        loadPlayerImage(staticImages[currentDirectionRef.current]);
                        if (animationIntervalRef.current) {
                            clearInterval(animationIntervalRef.current);
                            animationIntervalRef.current = null;
                        }
                    } else {
                        // 交互に画像を切替
                        if (frameRef.current === 0) {
                            loadPlayerImage(staticImages[currentDirectionRef.current]);
                            frameRef.current = 1;
                        } else {
                            loadPlayerImage(walkImages[currentDirectionRef.current]);
                            frameRef.current = 0;
                        }
                    }
                }, 300);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
                animationIntervalRef.current = null;
            }
        };
    }, []);

    // ----------------------------
    // タイル画像の読み込み
    // ----------------------------
    useEffect(() => {
        const tiles = Object.values(Tile_list);
        const loadedImagesObj: { [key: string]: HTMLImageElement } = {};
        tiles.forEach((tile) => {
            const img = new window.Image();
            img.src = `/tiles/${tile}.png`;
            img.onload = () => {
                loadedImagesObj[tile] = img;
                if (Object.keys(loadedImagesObj).length === tiles.length) {
                    setTileImages(loadedImagesObj);
                }
            };
        });
    }, []);

    // ----------------------------
    // カメラ位置の計算とアイテム画像の読み込み
    // ----------------------------
    useEffect(() => {
        const calculateInitialCameraPos = (playerX: number, playerY: number) => {
            const windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;
            const windowHeight = typeof window !== "undefined" ? window.innerHeight : 0;
            let targetX = playerX + Tile_size / 2 - windowWidth / 2;
            let targetY = playerY + Tile_size / 2 - windowHeight / 2;
            targetX = Math.max(0, Math.min(targetX, MAP_PIXEL_WIDTH - windowWidth));
            targetY = Math.max(0, Math.min(targetY, MAP_PIXEL_HEIGHT - windowHeight));
            targetX = windowWidth >= MAP_PIXEL_WIDTH ? 0 : targetX;
            targetY = windowHeight >= MAP_PIXEL_HEIGHT ? 0 : targetY;
            return {x: targetX, y: targetY};
        };

        setCameraPosition(calculateInitialCameraPos(ECollisionPosition.x, ECollisionPosition.y));

        const loadImages = async () => {
            const images: { [key: string]: HTMLImageElement } = {};
            if (!itemData) {
                console.warn("itemData is not available for loading images.");
                setLoadedImages({});
                return;
            }
            try {
                await Promise.all(
                    itemData.map(async (data) => {
                        if (data?.id && data.itemIcon) {
                            const img = new window.Image();
                            img.src = data.itemIcon;
                            await new Promise((resolve) => {
                                img.onload = () => {
                                    images[String(data.id)] = img;
                                    resolve(true);
                                };
                                img.onerror = (err) => {
                                    console.error(`Failed to load image: ${data.itemIcon}`, err);
                                    resolve(false);
                                };
                            });
                        }
                    })
                );
                setLoadedImages(images);
                console.log("Item images loaded:", Object.keys(images).length);
            } catch (error) {
                console.error("Error loading item images:", error);
            }
        };
        loadImages()

        loadImages();
    }, [itemData, ECollisionPosition.x, ECollisionPosition.y]);

    // ----------------------------
    // プレイヤーとクラフトアイテムの取得
    // ----------------------------
    useEffect(() => {
        if (playerId) {
            fetch(`/api/player/getItems/${playerId.id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === "success") {
                        setPlayerItems(data.items);
                    }
                })
                .catch((err) => console.error("Failed to fetch player items:", err));
            fetch(`/api/item/getCraftItems`, {method: "GET"})
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === "success") {
                        setCraftItems(data.craftItems);
                    }
                })
                .catch((err) => console.error("Failed to fetch player items:", err));
        }


    }, [playerId]);


    // アイテム取得イベントの処理
    useEffect(() => {
        if (itemEvents.length > 0) {
            const latestEvent = itemEvents[itemEvents.length - 1]; // 最新のイベントを取得

            setNotifications((prev) => {
                // 他のプレイヤーのイベントかどうかに関わらず通知を設定
                const message =
                    latestEvent.player_id !== playerId.id
                        ? `プレイヤーID:${latestEvent.player_id}がアイテムを取得しました`
                        : `アイテムを取得しました`;
                return [message, ...prev.slice(0, 4)];
            });

            // 最新のプレイヤーデータが存在する場合、アイテムリストを更新
            if (
                latestEvent.player_id === playerId.id &&
                latestEvent.data &&
                latestEvent.data.playerItems
            ) {
                setPlayerItems(latestEvent.data.playerItems);
            }
        }
    }, [itemEvents, playerId]);

    // アイテムクラフトイベントの処理
    useEffect(() => {
        if (craftEvents.length > 0) {
            const latestEvent = craftEvents[craftEvents.length - 1];
            if (latestEvent.player_id !== playerId.id) {
                // 他のプレイヤーのイベント
                setNotifications((prev) => [
                    `プレイヤーID:${latestEvent.player_id}がアイテムをクラフトしました`,
                    ...prev.slice(0, 4),
                ]);
            } else {
                // 自分のイベント
                setNotifications((prev) => [
                    `アイテムをクラフトしました`,
                    ...prev.slice(0, 4),
                ]);

                // プレイヤーのアイテムリストを更新
                if (latestEvent.data && latestEvent.data.playerItems) {
                    setPlayerItems(latestEvent.data.playerItems);
                }
            }
        }
    }, [craftEvents, playerId]);

    // アイテムクラフト関数
    const handleCraftItem = async (craftItemId: number) => {
        try {
            const playerDataId = playerId.id;

            const response = await fetch("/api/item/craftItem", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({playerDataId, craftItemId}),
            });

            const data = await response.json();

            if (data.status === "success") {
                setNotifications((prev) => [
                    `アイテムをクラフトしました`,
                    ...prev.slice(0, 4),
                ]);
            } else {
                setNotifications((prev) => [
                    `クラフト失敗: ${data.message}`,
                    ...prev.slice(0, 4),
                ]);
            }
        } catch (error) {
            console.error("Craft error:", error);
            setNotifications((prev) => [
                "クラフト中にエラーが発生しました",
                ...prev.slice(0, 4),
            ]);
        }
    };


    const getTilecolor = (list: string) => {
        switch (list) {
            case Tile_list.Grass:
                return "#74C365";
            case Tile_list.Path:
                return "#E5C07B";
            case Tile_list.Building:
                return "#8B5E3C";
            case Tile_list.Water:
                return "#4F94CD";
            case Tile_list.Tree:
                return "#228B22";
            case Tile_list.Leaves:
                return "#327040";
            case Tile_list.Stone:
                return "#747474";
            case Tile_list.Iron:
                return "#D1D1D1";
            case Tile_list.Coal:
                return "#2D2D2D";
            case Tile_list.Flower:
                return "#fa52e3";
            case Tile_list.Mushroom:
                return "#846847";
            case Tile_list.Insect:
                return "#ef5e3f";
            default:
                return "#74C365";
        }
    };

    // const handlekeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    //     e.preventDefault();
    //     let {x, y} = playerPosition;
    //
    //     switch (e.key) {
    //         case "ArrowUp":
    //             y -= Tile_size;
    //             break;
    //         case "ArrowDown":
    //             y += Tile_size;
    //             break;
    //         case "ArrowLeft":
    //             x -= Tile_size;
    //             break;
    //         case "ArrowRight":
    //             x += Tile_size;
    //             break;
    //     }
    //     console.log(playerPosition.x)
    //     console.log(playerPosition.y)
    //
    //     if (
    //         x >= 0 &&
    //         y >= 0 &&
    //         x < Map_width * Tile_size &&
    //         y < Map_height * Tile_size
    //     ) {
    //         setPlayerPosition({x, y});
    //         setCameraPosition({
    //             x: Math.max(0, x - window.innerWidth / 2),
    //             y: Math.max(0, y - window.innerHeight / 2),
    //         });
    //     }
    // };


    useEffect(() => {
        const windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;
        const windowHeight = typeof window !== "undefined" ? window.innerHeight : 0;
        let targetX = ECollisionPosition.x + Tile_size / 2 - windowWidth / 2;
        let targetY = ECollisionPosition.y + Tile_size / 2 - windowHeight / 2;
        targetX = Math.max(0, Math.min(targetX, MAP_PIXEL_WIDTH - windowWidth));
        targetY = Math.max(0, Math.min(targetY, MAP_PIXEL_HEIGHT - windowHeight));
        targetX = windowWidth >= MAP_PIXEL_WIDTH ? 0 : targetX;
        targetY = windowHeight >= MAP_PIXEL_HEIGHT ? 0 : targetY;
        setCameraPosition((prevCameraPos) => {
            if (Math.round(prevCameraPos.x) !== Math.round(targetX) || Math.round(prevCameraPos.y) !== Math.round(targetY)) {
                return {x: targetX, y: targetY};
            }
            return prevCameraPos;
        });
    }, [ECollisionPosition]);

    useEffect(() => {
        console.log("loadedImagesの更新:");
    }, [loadedImages]);
    // ----------------------------
    // プレイヤー画像切り替え用のロジック（2枚のpngを交互に切替）
    // ----------------------------
    interface CharacterImageData {
        iconImage: string[]; // 画像URLの配列

    }

    const [characterImageData, setCharacterImageData] = useState<CharacterImageData | null>(null);
    // console.log(characterImageData)
    useEffect(() => {
        const userId = playerId.id
        console.log("kokomadekitakanokakuni nnyamatatusann")
        // Fetch character data from API
        const fetchCharacterImages = async () => {
            try {
                const response = await fetch(`/api/character/image/${userId}`, {
                    method: "GET",
                    headers: {"Content-Type": "application/json"}
                });
                if (response.ok) {
                    const data = await response.json();


                    setCharacterImageData(data.userData);
                } else {
                    console.error("Failed to fetch character images");
                }
            } catch (error) {
                console.error("Error fetching character images:", error);
            }
        };

        fetchCharacterImages();
    }, [playerId.id]);


    // Loading or Error UI
    if (!connected) {
        return <div className="loading">サーバーに接続中...</div>;
    }

    if (error) {
        return <div className="error">エラー: {error}</div>;
    }
    return (
        <div style={{outline: "none"}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'}}>
                {characterImageData?.iconImage.map((url, index) => (
                    <div key={index} style={{textAlign: 'center'}}>
                        <Image src={url} alt={`Image ${index + 1}`} width={150} height={150}/>
                        <p>Image {index + 1}</p>
                    </div>
                ))}

            </div>

            {/*<Stage*/}
            {/*    width={typeof window !== "undefined" ? window.innerWidth : 0}*/}
            {/*    height={typeof window !== "undefined" ? window.innerHeight : 0}*/}
            {/*>*/}
            {/*    <Layer>*/}
            {/*        /!* --- 1. Grass背景 --- *!/*/}
            {/*        {Map_data.map((row, rowIndex) =>*/}
            {/*            row.map((_, colIndex) => {*/}
            {/*                const grassImg = tileImages["grass"];*/}
            {/*                if (!grassImg) return null;*/}
            {/*                return (*/}
            {/*                    <KonvaImage*/}
            {/*                        key={`grass-${rowIndex}-${colIndex}`}*/}
            {/*                        image={grassImg}*/}
            {/*                        x={colIndex * Tile_size - cameraPosition.x}*/}
            {/*                        y={rowIndex * Tile_size - cameraPosition.y}*/}
            {/*                        width={Tile_size}*/}
            {/*                        height={Tile_size}*/}
            {/*                        alt="タイル画像"*/}
            {/*                    />*/}
            {/*                );*/}
            {/*            })*/}
            {/*        )}*/}
            {/*        /!* --- 2. その他のタイル --- *!/*/}
            {/*        {Map_data.map((row, rowIndex) =>*/}
            {/*            row.map((tile, colIndex) => {*/}
            {/*                if (tile === "grass") return null;*/}
            {/*                const img = tileImages[tile];*/}
            {/*                if (!img) return null;*/}
            {/*                const isLargeTile = tile === "tree" || tile === "stone" || tile === "iron" || tile === "coal";*/}
            {/*                if (isLargeTile) {*/}
            {/*                    const isRightNeighborSame = Map_data[rowIndex]?.[colIndex - 1] === tile;*/}
            {/*                    const isBottomNeighborSame = Map_data[rowIndex - 1]?.[colIndex] === tile;*/}
            {/*                    const isBottomRightSame = Map_data[rowIndex - 1]?.[colIndex - 1] === tile;*/}
            {/*                    if (isRightNeighborSame || isBottomNeighborSame || isBottomRightSame) {*/}
            {/*                        return null;*/}
            {/*                    }*/}
            {/*                    return (*/}
            {/*                        <KonvaImage*/}
            {/*                            key={`${tile}-${rowIndex}-${colIndex}`}*/}
            {/*                            image={img}*/}
            {/*                            x={colIndex * Tile_size - cameraPosition.x}*/}
            {/*                            y={rowIndex * Tile_size - cameraPosition.y}*/}
            {/*                            width={Tile_size * 2}*/}
            {/*                            height={Tile_size * 2}*/}
            {/*                            alt="タイル画像"*/}
            {/*                        />*/}
            {/*                    );*/}
            {/*                }*/}
            {/*                return (*/}
            {/*                    <KonvaImage*/}
            {/*                        key={`${tile}-${rowIndex}-${colIndex}`}*/}
            {/*                        image={img}*/}
            {/*                        x={colIndex * Tile_size - cameraPosition.x}*/}
            {/*                        y={rowIndex * Tile_size - cameraPosition.y}*/}
            {/*                        width={Tile_size}*/}
            {/*                        height={Tile_size}*/}
            {/*                        alt="タイル画像"*/}
            {/*                    />*/}
            {/*                );*/}
            {/*            })*/}
            {/*        )}*/}
            {/*        /!*{itemData.map((data) => (*!/*/}
            {/*        /!*    <KonvaImage*!/*/}
            {/*        /!*        key={data.id} // _uniqueId を key に使う（id 重複を避ける）*!/*/}
            {/*        /!*        x={data.x! - cameraPosition.x}*!/*/}
            {/*        /!*        y={data.y! - cameraPosition.y}*!/*/}
            {/*        /!*        width={Tile_size}*!/*/}
            {/*        /!*        height={Tile_size}*!/*/}
            {/*        /!*        image={loadedImages[data.id]} // data.id で元の画像を参照*!/*/}
            {/*        /!*    />*!/*/}
            {/*        /!*))}*!/*/}

            {/*        /!* --- プレイヤー --- *!/*/}
            {/*        {playerImage && (*/}
            {/*            <KonvaImage*/}
            {/*                image={playerImage}*/}
            {/*                x={ECollisionPosition?.x - cameraPosition.x}*/}
            {/*                y={ECollisionPosition?.y - cameraPosition.y}*/}
            {/*                width={Tile_size}*/}
            {/*                height={Tile_size}*/}
            {/*                alt="プレイヤー写真"*/}
            {/*            />*/}
            {/*        )}*/}
            {/*    </Layer>*/}
            {/*</Stage>*/}
            {/* インベントリ */}
            <div>
                <button
                    className={styles.fixedOpenButton}
                    onClick={() => setIsOpen(true)}
                >
                    クリエイト
                </button>

                {isOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>×</button>
                            <div className={styles.inventory}>
                                <h3>インベントリ</h3>
                                <table className={styles.inventoryTable}>
                                    <thead>
                                    <tr>
                                        <th>アイテム名</th>
                                        <th>個数</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {playerItems?.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.DefaultItemList.itemName}</td>
                                            <td>{item.quantity}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.crafting}>
                                <h3>クラフトメニュー</h3>
                                <div>
                                    <p>選択中: {selectedItemId || '-- アイテムを選択 --'}</p>
                                    <div>
                                        {craftItems.map((craftItem) => (
                                            <div
                                                className={styles.craftButtons}
                                                key={craftItem.id}
                                                style={{
                                                    border: selectedItemId === craftItem.id ? '1px solid #000' : '1px solid transparent',
                                                }}
                                                onClick={() => handleSelectChange(craftItem.id)}
                                            >
                                                <div className={styles.column}>
                                                    <Image
                                                        src={craftItem.createdItem.itemIcon}
                                                        alt={craftItem.createdItem.itemName}
                                                        width={64}
                                                        height={64}
                                                    />
                                                    <span>{craftItem.createdItem.itemName}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={handleCraftClick} disabled={!selectedItemId}>
                                            作成
                                        </button>
                                    </div>
                                </div>

                                {/*<div className={styles.craftButtons}>*/}
                                {/*    <select value={selectedItemId} onChange={handleSelectChange}>*/}
                                {/*        <option value="">-- アイテムを選択 --</option>*/}
                                {/*        {craftItems?.map((craftItem) => (*/}
                                {/*            <div key={craftItem.id}>*/}
                                {/*                <option value={craftItem.id}>*/}
                                {/*                    {craftItem.createdItem?.itemName}*/}
                                {/*                </option>*/}
                                {/*                <Image src={craftItem.createdItem?.itemIcon} alt={"test"} width={64}*/}
                                {/*                       height={64}/>*/}
                                {/*            </div>*/}
                                {/*        ))}*/}
                                {/*    </select>*/}
                                {/*    <button onClick={handleCraftClick} disabled={!selectedItemId}>*/}
                                {/*        作成*/}
                                {/*    </button>*/}
                                {/*</div>*/}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapWithCharacter;
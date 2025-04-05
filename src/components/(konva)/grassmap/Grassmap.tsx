"use client";

import React, {useState, useEffect, KeyboardEvent, useMemo} from "react";
import {Stage, Layer, Rect, Image} from "react-konva";
import {
    Tile_size,
    Map_width,
    Map_height,
    generateItemPositions, Map_data, Tile_list, generateMap,
} from "./mapData";
import {PlayerItem} from "@/types/playerItem";
import {useSocketConnection} from "@/hooks/(realTime)/connection/useScoketConnection";
import useRemakeItemGet from "@/hooks/(realTime)/test/useRemakeItemGet";
import {useSupabaseRealtime} from "@/hooks/(realTime)/supabaseRealTime/useSupabaseRealTime";
import {defaultItem, RandomDefaultItem, RoomDefaultItem} from "@/types/defaultItem";
import useGetItem from "@/hooks/(animation)/getItem/useGetItem";

// プレイヤーをTile_sizeからx: 10 y: 10のところを取得する

interface GameProps {
    playerId: PlayerItem;
    itemData: defaultItem[];
    roomId: number;
}

const MapWithCharacter: React.FC<GameProps> = ({playerId, roomId, itemData}) => {
    const {socket, connected, players, items, error, movePlayer} = useSocketConnection(playerId.id, roomId);
    // プレイヤー移動

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
    // const [playerPosition, setPlayerPosition] = useState({x: playerId.x, y: playerId.y});
    const [tileImages, setTileImages] = useState<{
        [key: string]: HTMLImageElement;
    }>({});
    // プレイヤーアイテム情報の取得
    const stableInitialPosition = useMemo(() => ({
        x: playerId?.x ?? 0, // playerId.x が変わらない限り参照は同じ
        y: playerId?.y ?? 0  // playerId.y が変わらない限り参照は同じ
    }), [playerId?.x, playerId?.y]); // playerId の座標に依存
    // useRemakeItemGet フックの呼び出し


    const enhancedMapData = Map_data.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
            // オブジェクトに変換して関連情報を追加
            return {
                type: tile,  // "tree", "stone" などのタイルタイプ
                rowIndex,
                colIndex,
                // オブジェクトタイプに応じたアイテムIDを関連付け
                relatedItemId: tile === "tree" ? "wood" :
                    tile === "stone" ? "stone_material" :
                        tile === "iron" ? "iron_ore" :
                            tile === "coal" ? "coal" : null
            };
        })
    );
    const ObjectToItemMapping = {
        tree: "wood",
        stone: "stone_material",
        iron: "iron_ore",
        coal: "coal",
        flower: "flower_item",
        mushroom: "mushroom_item",
        insect: "insect_item"
    };
    // マップオブジェクトからインタラクト可能なオブジェクト情報を抽出する関数
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
                // オブジェクトタイプを確認
                const objectType = tile;

                // マッピングに存在するオブジェクトのみ処理
                if (objectType in ObjectToItemMapping) {
                    // 大きなオブジェクト（2x2）の場合の処理
                    const isLargeObject = ["tree", "stone", "iron", "coal"].includes(objectType);

                    if (isLargeObject) {
                        // 2x2の左上角のみ処理（重複を避けるため）
                        const isRightNeighborSame = mapData[rowIndex]?.[colIndex - 1] === objectType;
                        const isBottomNeighborSame = mapData[rowIndex - 1]?.[colIndex] === objectType;
                        const isBottomRightSame = mapData[rowIndex - 1]?.[colIndex - 1] === objectType;

                        if (isRightNeighborSame || isBottomNeighborSame || isBottomRightSame) {
                            return; // 左上角以外はスキップ
                        }

                        interactableObjects.push({
                            id: `map-${objectType}-${rowIndex}-${colIndex}`,
                            type: objectType,
                            x: colIndex * Tile_size,
                            y: rowIndex * Tile_size,
                            width: Tile_size * 2, // 2x2サイズ
                            height: Tile_size * 2,
                            isMapObject: true,
                            relatedItemId: ObjectToItemMapping[objectType as keyof typeof ObjectToItemMapping]
                        });
                    } else {
                        // 通常サイズ（1x1）のオブジェクト
                        interactableObjects.push({
                            id: `map-${objectType}-${rowIndex}-${colIndex}`,
                            type: objectType,
                            x: colIndex * Tile_size,
                            y: rowIndex * Tile_size,
                            width: Tile_size,
                            height: Tile_size,
                            isMapObject: true,
                            relatedItemId: ObjectToItemMapping[objectType as keyof typeof ObjectToItemMapping]
                        });
                    }
                }
            });
        });

        return interactableObjects;
    };


// 2. useRemakeItemGet に渡すデータを拡張する
// マップオブジェクトの位置情報も追加
    const allInteractiveElements = [
        ...itemData,  // 既存の素材アイテム
        ...enhancedMapData.flat().filter(tile =>
            // tree, stone などの大きなオブジェクトのみ抽出
            ["tree", "stone", "iron", "coal"].includes(tile.type)
        ).map(tile => ({
            id: `map-${tile.type}-${tile.rowIndex}-${tile.colIndex}`, // 一意のIDを生成
            x: tile.colIndex * Tile_size,
            y: tile.rowIndex * Tile_size,
            width: Tile_size * 2,  // 大きなオブジェクトは2x2サイズ
            height: Tile_size * 2,
            isMapObject: true,     // マップオブジェクトであることを示すフラグ
            objectType: tile.type, // オブジェクトタイプ
            relatedItemId: tile.relatedItemId // 関連するアイテムID
        }))
    ];

    const interactableMapObjects = extractInteractableObjects(Map_data);


    const {
        ECollisionPosition,
        ECollisionStatus,
        adjacentObstacles,
        adjacentMapObjects,
        ePressCount,
        handleEKeyPress
    } = useRemakeItemGet({
        userId: playerId.id,
        initialPosition: { x: playerId.x ?? 0, y: playerId.y ?? 0 },
        rectPositions: itemData,
        mapWidthInPixels: Map_width * Tile_size,
        mapHeightInPixels: Map_height * Tile_size,
        mapObjects: interactableMapObjects // マップオブジェクト情報を渡す
    });

    useEffect(() => {
        const tiles = Object.values(Tile_list);
        const loadedImages: { [key: string]: HTMLImageElement } = {};

        tiles.forEach((tile) => {
            const img = new window.Image();
            img.src = `/tiles/${tile}.png`;
            img.onload = () => {
                loadedImages[tile] = img;

                //全部読み込まれたら一気にリセット
                if (Object.keys(loadedImages).length === tiles.length) {
                    setTileImages(loadedImages);
                }
            };
        });
    }, []);

    useEffect(() => {
        // generateMap(); // 呼び出しタイミングを確認

        // 初期カメラ位置計算関数 (変更なし)
        const calculateInitialCameraPos = (playerX: number, playerY: number) => {
            const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
            const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
            let targetX = playerX + Tile_size / 2 - windowWidth / 2;
            let targetY = playerY + Tile_size / 2 - windowHeight / 2;
            targetX = Math.max(0, Math.min(targetX, MAP_PIXEL_WIDTH - windowWidth));
            targetY = Math.max(0, Math.min(targetY, MAP_PIXEL_HEIGHT - windowHeight));
            targetX = windowWidth >= MAP_PIXEL_WIDTH ? 0 : targetX;
            targetY = windowHeight >= MAP_PIXEL_HEIGHT ? 0 : targetY;
            return { x: targetX, y: targetY };
        };

        // ★ 変更: ECollisionPosition の初期値に基づいてカメラを設定
        setCameraPosition(calculateInitialCameraPos(ECollisionPosition.x, ECollisionPosition.y));

        // アイテム画像の読み込み (変更なし)
        // アイテム画像の読み込み
        const loadImages = async () => {
            const images: { [key: string]: HTMLImageElement } = {};
            // itemData が null や undefined でないことを確認
            if (!itemData) {
                console.warn("itemData is not available for loading images.");
                setLoadedImages({}); // 空にするか、以前の状態を維持するか
                return;
            }
            try {
                await Promise.all(
                    itemData.map(async (data) => {
                        // data.id と data.itemIcon の存在を確認
                        if (data?.id && data.itemIcon) {
                            const img = new window.Image();
                            img.src = data.itemIcon;
                            await new Promise((resolve, reject) => {
                                img.onload = () => {
                                    // id が数値の場合、文字列キーとして使用
                                    images[String(data.id)] = img;
                                    resolve(true);
                                };
                                img.onerror = (err) => {
                                    console.error(`Failed to load image: ${data.itemIcon}`, err);
                                    resolve(false); // エラーでも Promise は解決させる
                                };
                            });
                        } else {
                            // console.warn("Item data missing id or itemIcon:", data);
                        }
                    })
                );
                setLoadedImages(images);
                console.log("Item images loaded:", Object.keys(images).length); // ロードされた画像数
            } catch (error) {
                console.error("Error loading item images:", error);
            }
        };
        loadImages();

        // ★ 変更: 依存配列に ECollisionPosition を追加して初期位置反映を確実にする
    }, [itemData, ECollisionPosition.x, ECollisionPosition.y]);;

    // useEffect(() => {
    //     const occupiedPositions = new Set();

    //     const duplicatedItems = augmentedItemData.flatMap((item) => {
    //         const repeatCount = Math.floor(Math.random() * 5) + 1;
    //
    //         return Array.from({length: repeatCount}, (_, i) => {
    //             let randomTileX, randomTileY;
    //             do {
    //                 randomTileX = Math.floor(Math.random() * Map_width);
    //                 randomTileY = Math.floor(Math.random() * Map_height);
    //             } while (occupiedPositions.has(`${randomTileX}-${randomTileY}`));
    //
    //             occupiedPositions.add(`${randomTileX}-${randomTileY}`);
    //
    //             return {
    //                 ...item,
    //                 x: randomTileX,
    //                 y: randomTileY,
    //                 _uniqueId: `${item.id}-${i}-${Math.random()}`,
    //             };
    //         });
    //     });
    //
    //     setRandomPlacedItems(duplicatedItems);
    // }, [augmentedItemData]);


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
            fetch(`/api/item/getCraftItems`,{method : "GET"})
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

                return [message, ...prev.slice(0, 4)]; // 通知を最大5つまで保持
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

    useEffect(() => {
        const img = new window.Image();
        img.src = "/character3.png";
        img.onload = () => setPlayerImage(img);
    }, []);


    //   ↑どｆｋどｆ

    // const getTilecolor = (list: string) => {
    //   //switchはlistの値によって色を返している
    //   switch (list) {
    //     //Tile_listのGrassというケースの場合はreturnでカラーコードを返してあげる?
    //     case Tile_list.Grass:
    //       return "#74C365";
    //     case Tile_list.Path:
    //       return "#E5C07B";
    //     case Tile_list.Building:
    //       return "#8B5E3C";
    //     case Tile_list.Water:
    //       return "#4F94CD";
    //     case Tile_list.Tree:
    //       return "#228B22";
    //     case Tile_list.Leaves:
    //       return "#327040";
    //     case Tile_list.Stone:
    //       return "#747474";
    //     case Tile_list.Iron:
    //       return "#D1D1D1";
    //     case Tile_list.Coal:
    //       return "#2D2D2D";
    //     case Tile_list.Flower:
    //       return "#fa52e3";
    //     case Tile_list.Mushroom:
    //       return "#846847";
    //     case Tile_list.Insect:
    //       return "#ef5e3f";
    //     //デフォルトも草を設置
    //     default:
    //       return "#74C365";
    //   }
    // };

    // --- カメラ追従ロジック ---
    useEffect(() => {
        const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
        const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

        // 目標カメラ位置 (プレイヤーが中央に来るように)
        let targetX = ECollisionPosition.x + Tile_size / 2 - windowWidth / 2;
        let targetY = ECollisionPosition.y + Tile_size / 2 - windowHeight / 2;

        // カメラ位置をマップ境界内にクランプ
        targetX = Math.max(0, Math.min(targetX, MAP_PIXEL_WIDTH - windowWidth));
        targetY = Math.max(0, Math.min(targetY, MAP_PIXEL_HEIGHT - windowHeight));

        // ウィンドウがマップより大きい場合は 0 に固定
        targetX = windowWidth >= MAP_PIXEL_WIDTH ? 0 : targetX;
        targetY = windowHeight >= MAP_PIXEL_HEIGHT ? 0 : targetY;

        // setCameraPosition を関数形式で呼び出す
        setCameraPosition(prevCameraPos => {
            // 四捨五入して比較し、変化がある場合のみ新しいオブジェクトを返す
            if (Math.round(prevCameraPos.x) !== Math.round(targetX) || Math.round(prevCameraPos.y) !== Math.round(targetY)) {
                // console.log(`Updating camera: (${prevCameraPos.x}, ${prevCameraPos.y}) -> (${targetX}, ${targetY})`);
                return { x: targetX, y: targetY };
            }
            // 変化がなければ前の状態オブジェクトをそのまま返す (参照を維持し、不要な再レンダリング抑制)
            return prevCameraPos;
        });

// 依存配列は ECollisionPosition のみ！ cameraPosition を削除
    }, [ECollisionPosition]);

    // プレイヤーの位置 (ECollisionPosition) が変わったらカメラを更新
    // cameraPosition も依存配列に入れることで、target との比較が正しく行われる

    useEffect(() => {
        console.log("loadedImagesの更新:",);
    }, [loadedImages]);


    let imageElements = null;

    // if (itemData.length > 0 && Object.keys(loadedImages).length > 0) {
    //     imageElements = itemData.map((data, index) => (
    //         <Image
    //             key={data.items?.id} // ユニークキーを設定
    //             x={100 + 100 * index} // X座標
    //             y={100} // Y座標
    //             width={100} // 幅
    //             height={100} // 高さ
    //             image={loadedImages[data.items?.id]} // ロード済み画像を適用
    //         />
    //
    //     ));
    // }

    useEffect(() => {
        console.log("loadedImages:", loadedImages);
        console.log("items", itemData.length);
    }, [loadedImages , itemData]);


    // Loading or Error UI
    if (!connected) {
        return <div className="loading">サーバーに接続中...</div>;
    }

    if (error) {
        return <div className="error">エラー: {error}</div>;
    }


    // console.log(craftItems)


    return (
        <div  style={{ outline: "none" }}>
            <Stage
                width={typeof window !== "undefined" ? window.innerWidth : 0}
                height={typeof window !== "undefined" ? window.innerHeight : 0}
            >
                <Layer>
                    {/* --- 1. Grass背景を全マスに描画 --- */}
                    {Map_data.map((row, rowIndex) =>
                        row.map((_, colIndex) => {
                            const grassImg = tileImages["grass"];
                            if (!grassImg) return null;

                            return (
                                <Image
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

                    {/* --- 2. タイルの上書き描画（透明含む） --- */}
                    {Map_data.map((row, rowIndex) =>
                        row.map((tile, colIndex) => {
                            // grassはすでに描画されているのでスキップ
                            if (tile === "grass") return null;

                            const img = tileImages[tile];
                            if (!img) return null;

                            // 2x2サイズの判定（さっきのロジックと同じ）
                            const isLargeTile =
                                tile === "tree" ||
                                tile === "stone" ||
                                tile === "iron" ||
                                tile === "coal";

                            if (isLargeTile) {
                                const isRightNeighborSame =
                                    Map_data[rowIndex]?.[colIndex - 1] === tile;
                                const isBottomNeighborSame =
                                    Map_data[rowIndex - 1]?.[colIndex] === tile;
                                const isBottomRightSame =
                                    Map_data[rowIndex - 1]?.[colIndex - 1] === tile;

                                if (
                                    isRightNeighborSame ||
                                    isBottomNeighborSame ||
                                    isBottomRightSame
                                ) {
                                    return null; // スキップ（左上のみ描画）
                                }

                                return (
                                    <Image
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

                            // 通常サイズのタイル
                            return (
                                <Image
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
                    )}
                    {/*{itemData.map((data) => (*/}
                    {/*    <Image*/}
                    {/*        key={data.id} // _uniqueId を key に使う（id 重複を避ける）*/}
                    {/*        x={data.x!  - cameraPosition.x}*/}
                    {/*        y={data.y! - cameraPosition.y}*/}
                    {/*        width={Tile_size}*/}
                    {/*        height={Tile_size}*/}
                    {/*        image={loadedImages[data.id]} // data.id で元の画像を参照*/}
                    {/*    />*/}
                    {/*))}*/}

                    {/* --- プレイヤー --- */}
                    {playerImage && ECollisionPosition && (
                        <Image
                            image={playerImage}
                            x={ECollisionPosition.x - cameraPosition.x}
                            y={ECollisionPosition.y - cameraPosition.y}
                            width={Tile_size}
                            height={Tile_size}
                            alt="プレイヤー"
                            listening={false}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default MapWithCharacter;
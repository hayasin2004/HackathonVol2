"use client";

import React, {useState, useEffect, KeyboardEvent} from "react";
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

    const {itemEvents, craftEvents} = useSupabaseRealtime(roomId, playerId.id);


    const [playerItems, setPlayerItems] = useState<any[]>([]);
    const [craftItems, setCraftItems] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<string[]>([]);
    const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
    const [cameraPosition, setCameraPosition] = useState({x: 0, y: 0});
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [augmentedItemData, setAugmentedItemData] = useState<RoomDefaultItem[]>([]);
    const [randomPlacedItems, setRandomPlacedItems] = useState<RandomDefaultItem[]>([]);
    const [playerPosition, setPlayerPosition] = useState({x: playerId.x, y: playerId.y});

    // プレイヤーアイテム情報の取得


    const {ECollisionPosition, ECollisionStatus, adjacentObstacles, } = useRemakeItemGet({
        userId: playerId.id,
        initialPosition: {x: playerPosition.x, y: playerPosition.y},
        circleRadius: 30,
        rectPositions: randomPlacedItems,
        movePlayer,
    });


    useEffect(() => {

        const initialPlayerPosition = {x: playerId.x, y: playerId.y}
        setPlayerPosition(initialPlayerPosition);
        const mapData = generateMap();
        const itemPositions = generateItemPositions(itemData, mapData, 1);
        const result = itemData.map((data, index) => ({
            ...data,
            tileX: itemPositions[index]?.tileX,
            tileY: itemPositions[index]?.tileY,
        }));
        setAugmentedItemData(result);


        const loadImages = async () => {
            const images: { [key: string]: HTMLImageElement } = {}; // ロード済み画像を一時保存するオブジェクト

            // 非同期処理で全画像をロード
            await Promise.all(
                itemData.map(async (data) => {
                    const itemIcon = data.itemIcon; // アイコンURLを取得

                    if (itemIcon) {
                        const img = new window.Image();
                        img.src = itemIcon;

                        // ロード完了後に`images`に保存
                        await new Promise((resolve, reject) => {
                            img.onload = () => {
                                images[data?.id] = img; // IDをキーに画像を保存
                                resolve(true);
                            };
                            img.onerror = () => {
                                console.error(`画像のロード失敗: ${itemIcon}`);
                                reject(false);
                            };
                        });
                    }
                })
            );

            setLoadedImages(images); // 状態に反映
        };
        loadImages()

    }, [itemData]);

    useEffect(() => {
        const occupiedPositions = new Set();

        const duplicatedItems = augmentedItemData.flatMap((item) => {
            const repeatCount = Math.floor(Math.random() * 5) + 1;

            return Array.from({length: repeatCount}, (_, i) => {
                let randomTileX, randomTileY;
                do {
                    randomTileX = Math.floor(Math.random() * Map_width);
                    randomTileY = Math.floor(Math.random() * Map_height);
                } while (occupiedPositions.has(`${randomTileX}-${randomTileY}`));

                occupiedPositions.add(`${randomTileX}-${randomTileY}`);

                return {
                    ...item,
                    tileX: randomTileX,
                    tileY: randomTileY,
                    _uniqueId: `${item.id}-${i}-${Math.random()}`,
                };
            });
        });

        setRandomPlacedItems(duplicatedItems);
    }, [augmentedItemData]);
    ;

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
        img.src = "/character.png";
        img.onload = () => setPlayerImage(img);
    }, []);


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
    }, [loadedImages]);


    // Loading or Error UI
    if (!connected) {
        return <div className="loading">サーバーに接続中...</div>;
    }

    if (error) {
        return <div className="error">エラー: {error}</div>;
    }
    itemData.map((data, index) => {
        const imageNode = loadedImages[data.id];

        if (!imageNode) {
            console.log(`画像がロードされていません: id=${data.id}`);
            return null; // ロードされていない場合は描画しない
        }
    })

    console.log(craftItems)


    return (


        <div tabIndex={0} style={{outline: "none"}}>
            <Stage
                width={typeof window !== "undefined" ? window.innerWidth : 0}
                height={typeof window !== "undefined" ? window.innerHeight : 0}
            >
                <Layer>
                    {/*{itemRandom?.map((item, index) => (*/}
                    {/*    <li key={index}>*/}
                    {/*        アイテムID: {item.id}, X座標: {item.tileX}, Y座標: {item.tileY}*/}
                    {/*    </li>*/}
                    {/*))}*/}
                    {Map_data.map((row, rowIndex) =>
                        row.map((tile, colIndex) => (
                            <Rect
                                key={`${rowIndex}-${colIndex}`}
                                x={colIndex * Tile_size - cameraPosition.x}
                                y={rowIndex * Tile_size - cameraPosition.y}
                                width={Tile_size}
                                height={Tile_size}
                                fill={getTilecolor(tile)}
                            />
                        ))
                    )}

                    {randomPlacedItems.map((data) => (
                        <Image
                            key={data._uniqueId} // _uniqueId を key に使う（id 重複を避ける）
                            x={data.x! - cameraPosition.x}
                            y={data.y! - cameraPosition.y}
                            width={Tile_size}
                            height={Tile_size}
                            image={loadedImages[data.id]} // data.id で元の画像を参照
                        />
                    ))}


                    {/*{itemRandom?.map((item) => (*/}

                    {/*    <Image*/}
                    {/*        key={item?.item?.id}*/}
                    {/*        x={item?.tileX * Tile_size - cameraPosition.x}*/}
                    {/*        y={item?.tileY * Tile_size - cameraPosition.y}*/}
                    {/*        width={Tile_size}*/}
                    {/*        height={Tile_size}*/}
                    {/*        image={playerImage}*/}
                    {/*    />*/}
                    {/*))}*/}

                    {playerImage && (
                        <Image
                            image={playerImage}
                            x={ECollisionPosition?.x - cameraPosition.x}
                            y={ECollisionPosition?.y - cameraPosition.y}
                            width={Tile_size}
                            height={Tile_size}
                            alt="プレイヤー写真"
                        />
                    )}
                </Layer>
            </Stage>
            {/* インベントリ */}
            <div className="inventory">
                <h3>インベントリ</h3>
                <div className="items-grid"
                     style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px'}}>
                    {playerItems.map((item) => (
                        <div key={item.id} className="item-box" style={{border: '1px solid #ccc', padding: '5px'}}>
                            <div>{item.DefaultItemList.itemName}</div>
                            <div>個数: {item.quantity}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* クラフトメニュー */}
            <div className="crafting" style={{marginTop: '20px'}}>
                <h3>クラフトメニュー</h3>
                <div className="craft-buttons">
                    {/* 例として、クラフト可能なアイテムを表示 */}
                    {craftItems?.map((craftItem) => (
                        <div key={craftItem.id}>
                            <p>{craftItem.createdItem?.itemName}</p>
                            <button onClick={() => handleCraftItem(craftItem.id)}>作成</button>
                        </div>
                    ))}
                    <button >アイテム1をクラフト</button>
                    <button onClick={() => handleCraftItem(2)}>アイテム2をクラフト</button>
                </div>
            </div>
        </div>
    );
};

export default MapWithCharacter;
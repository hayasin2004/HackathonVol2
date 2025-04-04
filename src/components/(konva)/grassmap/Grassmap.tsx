"use client";

import React, {useState, useEffect, KeyboardEvent} from "react";
import {Stage, Layer, Rect, Image} from "react-konva";
import {
    Tile_size,
    Map_width,
    Map_height,
    Tile_list,
    generateItemPositions,
} from "./mapData";
import {PlayerItem} from "@/types/playerItem";
import {useSocketConnection} from "@/hooks/(realTime)/connection/useScoketConnection";
import useRemakeItemGet from "@/hooks/(realTime)/test/useRemakeItemGet";
import {useSupabaseRealtime} from "@/hooks/(realTime)/supabaseRealTime/useSupabaseRealTime";
import {defaultItem} from "@/types/defaultItem";

// プレイヤーをTile_sizeからx: 10 y: 10のところを取得する
const initialPlayerPosition = {x: 10 * Tile_size, y: 10 * Tile_size};

interface GameProps {
    playerId: PlayerItem;
    itemData: defaultItem[] ;
    roomId: number;
}

const MapWithCharacter: React.FC<GameProps> = ({playerId, roomId , itemData}) => {
    const {socket, connected, players, items, error, movePlayer} = useSocketConnection(playerId.id, roomId);
    // プレイヤー移動
    const remakeResult = playerId?.id
        ? useRemakeItemGet({
            userId: playerId.id,
            initialPosition: {x: playerId.x, y: playerId.y},
            circleRadius: 30,
            rectPositions: items,
            speed: 10,
            movePlayer,
        })
        : null;

    const {itemEvents, craftEvents} = useSupabaseRealtime(roomId, playerId.id);

    const [playerItems, setPlayerItems] = useState<any[]>([]);
    const [itemRandom, setItemRandom] = useState<Array<{ items: defaultItem, tileX: number, tileY: number }> | []>([]);
    const [notifications, setNotifications] = useState<string[]>([]);

    const [playerPosition, setPlayerPosition] = useState(initialPlayerPosition);
    const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
    const [cameraPosition, setCameraPosition] = useState({x: 0, y: 0});
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: HTMLImageElement }>({});


    // プレイヤーアイテム情報の取得

    useEffect(() => {
        // const ItemRandomList = generateItemPositions(itemData)
        // setItemRandom(ItemRandomList);
        console.log(itemData)
    }, [itemData]);

    useEffect(() => {
        console.log(itemRandom)
    }, [itemRandom]);

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
    useEffect(() => {
        const loadImages = async () => {
            const images: { [key: string]: HTMLImageElement } = {}; // ロードした画像を格納する

            // 非同期処理で全ての画像をロード
            await Promise.all(
                itemRandom.map(async (data) => {
                    const itemIcon = data.items?.item?.itemIcon; // itemIconを安全にアクセス

                    if (itemIcon) { // URLが存在する場合に処理
                        const img = new window.Image();
                        img.src = itemIcon; // 画像のソースを設定

                        // Promiseでロード完了を待つ
                        await new Promise((resolve, reject) => {
                            img.onload = () => {
                                images[data.items.item.id] = img; // IDをキーにして画像を格納
                                resolve(true); // 成功時
                            };
                            img.onerror = () => {
                                console.error(`画像のロードに失敗しました: ${itemIcon}`);
                                reject(false); // エラー時
                            };
                        });
                    } else {
                        console.warn(`無効なitemIcon: ${data.items?.item?.id}`);
                    }
                })
            );

            // ロードした画像を一括で更新
            setLoadedImages(images);
        };

        loadImages();
    }, [itemRandom]); // itemRandomが変化したときに再実行;


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

    const handlekeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        let {x, y} = playerPosition;

        switch (e.key) {
            case "ArrowUp":
                y -= Tile_size;
                break;
            case "ArrowDown":
                y += Tile_size;
                break;
            case "ArrowLeft":
                x -= Tile_size;
                break;
            case "ArrowRight":
                x += Tile_size;
                break;
        }

        if (
            x >= 0 &&
            y >= 0 &&
            x < Map_width * Tile_size &&
            y < Map_height * Tile_size
        ) {
            setPlayerPosition({x, y});
            setCameraPosition({
                x: Math.max(0, x - window.innerWidth / 2),
                y: Math.max(0, y - window.innerHeight / 2),
            });
        }
    };



    useEffect(() => {
        const loadImages = async () => {
            const images: { [key: string]: HTMLImageElement } = {}; // ロード済み画像を一時保存するオブジェクト

            // 非同期処理で全画像をロード
            await Promise.all(
                itemRandom.map(async (data) => {
                    const itemIcon = data.items?.itemIcon; // アイコンURLを取得

                    if (itemIcon) {
                        const img = new window.Image();
                        img.src = itemIcon;

                        // ロード完了後に`images`に保存
                        await new Promise((resolve, reject) => {
                            img.onload = () => {
                                images[data?.items?.id] = img; // IDをキーに画像を保存
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

        if (itemRandom.length > 0) {
            loadImages();
        }
    }, [itemRandom]);

    useEffect(() => {
        console.log("loadedImagesの更新:", loadedImages);
    }, [loadedImages]);


    let imageElements = null;

    if (itemRandom.length > 0 && Object.keys(loadedImages).length > 0) {
        imageElements = itemRandom.map((data, index) => (
            <Image
                key={data.items?.id} // ユニークキーを設定
                x={100 + 100} // X座標
                y={100} // Y座標
                width={100} // 幅
                height={100} // 高さ
                image={loadedImages[data.items?.id]} // ロード済み画像を適用
            />

        ));
    }

    useEffect(() => {
        console.log("itemRandom:", itemRandom);
        console.log("loadedImages:", loadedImages);
        console.log("items",itemData.length);
    }, [loadedImages]);


    // Loading or Error UI
    if (!connected) {
        return <div className="loading">サーバーに接続中...</div>;
    }

    if (error) {
        return <div className="error">エラー: {error}</div>;
    }

    return (


        <div tabIndex={0} onKeyDown={handlekeyDown} style={{outline: "none"}}>
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
                    {/*{Map_data.map((row, rowIndex) =>*/}
                    {/*    row.map((tile, colIndex) => (*/}
                    {/*        <Rect*/}
                    {/*            key={`${rowIndex}-${colIndex}`}*/}
                    {/*            x={colIndex * Tile_size - cameraPosition.x}*/}
                    {/*            y={rowIndex * Tile_size   - cameraPosition.y}*/}
                    {/*            width={Tile_size}*/}
                    {/*            height={Tile_size}*/}
                    {/*            fill={getTilecolor(tile)}*/}
                    {/*        />*/}
                    {/*    ))*/}
                    {/*)}*/}
                    {itemRandom.map((data) => (
                        <Image
                            key={data.items?.id} // ユニークなキーを指定
                            x={data.tileX * Tile_size - cameraPosition.x}
                            y={data.tileY * Tile_size - cameraPosition.y}
                            width={Tile_size}
                            height={Tile_size}
                            image={loadedImages[data.items?.id]} // ロード済みの画像を設定
                        />
                    ))}
                    {/*{imageElements}*/}

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
                            x={playerPosition.x - cameraPosition.x}
                            y={playerPosition.y - cameraPosition.y}
                            width={Tile_size}
                            height={Tile_size}
                            alt="プレイヤー写真"
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default MapWithCharacter;
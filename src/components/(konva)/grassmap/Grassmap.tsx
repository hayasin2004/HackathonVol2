"use client";

import React, {useState, useEffect} from "react";
import {Stage, Layer, Rect, Image as KonvaImage} from "react-konva";
import {
    Tile_size,
    Map_width,
    Map_height,
    Map_data
} from "./mapData";
import Image from "next/image"
import {useSocketConnection} from "@/hooks/(realTime)/connection/useScoketConnection";
import useRemakeItemGet from "@/hooks/(realTime)/test/useRemakeItemGet";
import {useSupabaseRealtime} from "@/hooks/(realTime)/supabaseRealTime/useSupabaseRealTime";
import {defaultItem} from "@/types/defaultItem";
import styles from './page.module.css'
import {ToastContainer, toast} from 'react-toastify';
import {logout} from "@/lib/nextAuth-actions";
import {craftItem, updatePlayerItems} from "@/repository/prisma/craftItemRepository";
import {extractInteractableObjects} from "@/script/extractInteractableObjects";
import {MapTilesType} from "@/types/map";
import {get_character} from "@/script/get_character";
import useCharacterImage from "@/hooks/(realTime)/2D/2Dcamera/getCharacterImage/useCharacterImage";
import useCameraPosition from "@/hooks/(realTime)/2D/2Dcamera/initialCameraPosition/useCameraPosition";
import useGenerateMap from "@/hooks/(realTime)/2D/2DMap/firstMapGenerateTile/useGenerateMap";
import useMotionCharacter from "@/hooks/(realTime)/2D/2DCharacterMotion/useMotionCharacter";
import {CharacterImageData} from "@/types/character";
import {PlayerHaveItem, PlayerItem} from "@/types/playerItem";
import useGetItem from "@/hooks/(realTime)/item/getItem/useGetItem";
import PlayerInventory from "@/components/playerInventory/PlayerInventory";

// プレイヤーをTile_sizeからx: 10 y: 10のところを取得する

interface GameProps {
    playerId: PlayerItem;
    itemData: defaultItem[];
    roomId: number;
}


const MapWithCharacter: React.FC<GameProps> = ({playerId, roomId, itemData}) => {
    const {socket, connected, players, items, error, movePlayer} = useSocketConnection(playerId.playerId, roomId);

    const {itemEvents, craftEvents} = useSupabaseRealtime(roomId, playerId.id);
    // const [notifications, setNotifications] = useState<string[]>([]);
    const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
    const [cameraPosition, setCameraPosition] = useState({x: 0, y: 0});
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [tileImages, setTileImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [interactableMapObjects, setInteractableMapObjects] = useState<Array<MapTilesType>>([]);
    const [isDark, setIsDark] = useState(false);


    const {
        ECollisionPosition,
        eCollisionGotItem,
        clearGotItems
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

    const [characterImageData, setCharacterImageData] = useState<CharacterImageData | null>(null);

    const {playerCharacter, isLoadingCharacter} = useMotionCharacter(characterImageData)

    if (isLoadingCharacter) {
        console.log("キャラクター読み込み中")
    }

    // ----------------------------
    // カメラ位置の計算とアイテム画像の読み込み
    // ----------------------------
    const cameraPositionHook = useCameraPosition(
        ECollisionPosition.x,
        ECollisionPosition.y
    );


    useEffect(() => {
        // cameraPositionの変更を検知して状態を更新
        setCameraPosition(cameraPositionHook);
    }, [cameraPosition, ECollisionPosition]);


    // ----------------------------
    // タイル画像の読み込み
    // ----------------------------
    const {tileImagesComplete, isLoading} = useGenerateMap()

    useEffect(() => {
        setTileImages(tileImagesComplete)
    }, [tileImagesComplete, isLoading]);

    useEffect(() => {
        // キャラクター生成
        const userId = playerId.playerId
        const fetchCharacterImages = async () => {
            try {
                const response = await get_character(userId)
                setCharacterImageData(response); // まとめて状態を更新
            } catch (error) {
                console.error("Error fetching character images:", error);
            }
        };
        // マップの初期設定
        const interactableMapObjects = extractInteractableObjects();
        if (interactableMapObjects) {
            setInteractableMapObjects(interactableMapObjects)
        }

        // 20パーの確立でマップを暗くする
        const shouldBeDark = Math.random() < 0.2; // 20%の確率
        setIsDark(shouldBeDark);
        fetchCharacterImages()
    }, [playerId]);


    // アイコン取得のカスタムフック
    const LoadPlayerCharacterImage = useCharacterImage(itemData)

    useEffect(() => {
        setLoadedImages(LoadPlayerCharacterImage)
    }, [itemData]);


    useEffect(() => {
        if (Array.isArray(eCollisionGotItem) && eCollisionGotItem.length > 0) {
            const getItemNameMap: { [key: string]: string } = {
                tree: "木の棒",
                stone: "石",
                coal: "石炭",
                iron: "鉄",
                flower: "花",
                mushroom: "キノコ",
                insect: "虫",
                water: "不思議な水"
            };

            eCollisionGotItem.forEach((item, index) => {
                const getItemName = getItemNameMap[item];
                if (!getItemName) return;

                // 通知表示
                toast.success(`アイテムを取得しました: ${getItemName}`, {
                    toastId: `${item}-${index}`
                });

                console.log(`通知発生: ${item}`);
            });

            // 状態リセット（必要に応じて）
            // setECollisionGotItem([]);
            clearGotItems()
        } else {

            console.log("みかくほ");
        }
    }, [eCollisionGotItem]);






    // 没アイテム取得　多分マルチプレイの時にまた使うと思う
    const {playerItemsHook} = useGetItem(itemEvents, playerId)
    useEffect(() => {
        setPlayerImage(playerItemsHook)
    }, [itemEvents, playerId]);

    // アイテムクラフトイベントの処理
    // useEffect(() => {
    //     console.log("これは来たのか・")
    //     if (craftEvents.length > 0) {
    //         const latestEvent = craftEvents[craftEvents.length - 1];
    //         if (latestEvent.player_id !== playerId.id) {
    //             // 他のプレイヤーのイベント
    //             setNotifications((prev) => [
    //                 `プレイヤーID:${latestEvent.player_id}がアイテムをクラフトしました`,
    //                 ...prev.slice(0, 4),
    //             ]);
    //         } else {
    //             // 自分のイベント
    //             setNotifications((prev) => [
    //                 `アイテムをクラフトしました`,
    //                 ...prev.slice(0, 4),
    //             ]);
    //
    //             // プレイヤーのアイテムリストを更新
    //             if (latestEvent.data && latestEvent.data.playerItems) {
    //
    //                 setPlayerItems(latestEvent.data.playerItems);
    //             }
    //         }
    //     }
    // }, [craftEvents, playerId]);


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
                {/*{characterImageData?.iconImage.slice(0, 8).map((url, index) => (*/}
                {/*    <div key={index} style={{textAlign: 'center'}}>*/}
                {/*        <Image src={url} alt={`Image ${index + 1}`} width={150} height={150}/>*/}
                {/*        <p>Image {index + 1}</p>*/}
                {/*    </div>*/}
                {/*))}*/}
            </div>
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
            {/* インベントリ */}
            <div>

                <PlayerInventory playerId={playerId} eCollisionGotItem={eCollisionGotItem} craftEvents={craftEvents} />
                <form action={logout}>
                    <button className={styles.fixedLogOutButton}>
                        ログアウト
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MapWithCharacter;
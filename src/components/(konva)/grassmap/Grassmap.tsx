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
import useFetchItem from "@/hooks/(realTime)/item/fetchItem/useFetchItem";
import useCraftItem from "@/hooks/(realTime)/item/CraftANDFetchItem/useCraftItem";
import {PlayerHaveItem, PlayerItem} from "@/types/playerItem";
import useGetItem from "@/hooks/(realTime)/item/getItem/useGetItem";
import PlayerInventory from "@/components/playerInventory/PlayerInventory";
import MapVolOne from "@/components/mapVolOne/MapVolOne";
import useToastItem from "@/hooks/(realTime)/item/toastItem/useToastItem";
import {usePlayerMovement} from "@/hooks/(realTime)/playerMovement/usePlayerMovement";

// プレイヤーをTile_sizeからx: 10 y: 10のところを取得する

interface GameProps {
    playerId: PlayerItem;
    itemData: defaultItem[];
    roomId: number;
}


const MapWithCharacter: React.FC<GameProps> = ({playerId, roomId, itemData}) => {

    const {itemEvents, craftEvents} = useSupabaseRealtime(roomId, playerId.id);
    // const [notifications, setNotifications] = useState<string[]>([]);
    const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
    const [cameraPosition, setCameraPosition] = useState({x: 0, y: 0});
    const [cameraPositionTest, setCameraPositionTest] = useState({x: 0, y: 0});
    console.log(cameraPositionTest)
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [tileImages, setTileImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [interactableMapObjects, setInteractableMapObjects] = useState<Array<MapTilesType>>([]);
    const [notifications, setNotifications] = useState<string[]>([]);
    console.log(notifications)



    const {
        ECollisionPosition,
        eCollisionGotItem,
        clearGotItems,
    } = useRemakeItemGet({
        userId: playerId.id,
        initialPosition: {x: playerId.x ?? 0, y: playerId.y ?? 0},
        rectPositions: itemData,
        mapWidthInPixels: Map_width * Tile_size,
        mapHeightInPixels: Map_height * Tile_size,
        mapObjects: interactableMapObjects,
    });

    const {socket, connected, players, items, error, movePlayer} = useSocketConnection(playerId.playerId, roomId);



    // ----------------------------
    // プレイヤー画像切り替え用のロジック（2枚のpngを交互に切替）
    // ----------------------------

    const [characterImageData, setCharacterImageData] = useState<CharacterImageData | null>(null);

    const {playerCharacter, isLoadingCharacter} = useMotionCharacter(characterImageData)

    if (isLoadingCharacter) {
        console.log("キャラクター読み込み中")
    }
    const {position} = usePlayerMovement({
        initialX: ECollisionPosition.x,
        initialY: ECollisionPosition.y,
        speed: 64,
        movePlayer
    });
    useEffect(() => {
        movePlayer(ECollisionPosition.x ,ECollisionPosition.y)
    }, [ECollisionPosition]);

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

        fetchCharacterImages()
    }, [playerId]);


    // アイコン取得のカスタムフック
    const LoadPlayerCharacterImage = useCharacterImage(itemData)

    useEffect(() => {
        setLoadedImages(LoadPlayerCharacterImage)
    }, [itemData]);


    const {setECollisionGotItem, triggerToast} = useToastItem(clearGotItems);


    useEffect(() => {
        if (Array.isArray(eCollisionGotItem) && eCollisionGotItem.length > 0) {
            // 通知表示
            triggerToast(eCollisionGotItem);

            // 状態リセットを分離
            setTimeout(() => {
                setECollisionGotItem([]);
            }, 0); // 状態リセットを非同期的に実行
        }
    }, [eCollisionGotItem]);


    // 没アイテム取得　多分マルチプレイの時にまた使うと思う
    const {playerItemsHook} = useGetItem(itemEvents, playerId)
    useEffect(() => {
        setPlayerImage(playerItemsHook)
    }, [itemEvents, playerId]);

    // // アイテムクラフトイベントの処理
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
            <MapVolOne
                playerId={playerId}
                ECollisionPosition={ECollisionPosition}
                playerCharacter={playerCharacter}
            />
            {/* インベントリ */}
            <div>

                <PlayerInventory playerId={playerId} eCollisionGotItem={eCollisionGotItem} craftEvents={craftEvents}/>
                <form action={logout}>
                    <button className={styles.fixedLogOutButton}>
                        ログアウト
                    </button>
                </form>
            </div>
            {/* 他のプレイヤー */}
            {players
                .filter(player => player.playerId !== playerId)
                .map((player, index) => (
                    <div
                        key={player.playerId || `player-${index}`}
                        className="other-player"
                        style={{
                            position: 'absolute',
                            left: `${player.x}px`,
                            top: `${player.y}px`,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'red',
                            zIndex: 10,
                        }}
                    >
                        {player.playerId}

                    </div>
                ))}
        </div>
    );
};

export default MapWithCharacter;
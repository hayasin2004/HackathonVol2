import React, {useState, useEffect, useRef} from "react";

import useGenerateMap from "@/hooks/(realTime)/2D/2DMap/firstMapGenerateTile/useGenerateMap";
import {PlayerItem} from "@/types/playerItem";
import {Map_data, Tile_size} from "@/components/(konva)/grassmap/mapData";
import useCameraPosition from "@/hooks/(realTime)/2D/2Dcamera/initialCameraPosition/useCameraPosition";
import {Stage, Layer, Rect, Image as KonvaImage, Text, Line} from "react-konva";
import {defaultItem} from '@/types/defaultItem';
import {objectItemIconImage} from "@/hooks/(realTime)/test/useRemakeItemGet";
import {io, Socket} from "socket.io-client";
import EnemyTest from "@/components/(konva)/enemy/EnemyTest";
import {Enemy} from "@/types/enemy";
import {GetEnemy} from "@/repository/prisma/enemy/enemyRepository";
import {NPC} from "@/types/npc";
import {supabase} from "@/lib/supabase";
import NpcTest from "@/components/(konva)/npc/NpcTest";
import firstQuest from "@/repository/prisma/quest/firstQuest/firstQuest";
import {QuestType} from "@/types/quest";
import {toast, ToastContainer} from "react-toastify";
import {getNextQuest} from "@/repository/prisma/quest/secondQuest/secondQuest";
import DSCQuest from "@/repository/prisma/quest/DSCQuest/DSCQuest";

// const socket = io('http://localhost:5000');
interface mapVolOneTypes {
    playerId: PlayerItem
    ECollisionPosition: { x: number, y: number }
    nearbyItemPosition: { x: number, y: number } | null,
    playerCharacter: HTMLImageElement | null
    objectItemImage: objectItemIconImage[] | null
    socket: Socket | null
    players : any[]
    enemyData: Enemy[] | null
    npcData : NPC[] | null
    onItemRemove?: (enemyId: string) => void
    onDialogOpen?: (isOpen: boolean) => void;
}

const MapVolOne: React.FC<mapVolOneTypes> = ({
                                                 playerId,
                                                 ECollisionPosition,
                                                 playerCharacter,
                                                 objectItemImage,
                                                 nearbyItemPosition,
                                                 enemyData,
                                                 socket,
                                                 players,
                                                 npcData,
                                                 onDialogOpen,
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
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});

    const [isAlertTriggered, setIsAlertTriggered] = useState(false);
    const [isNpcDialogOpen, setINpcDialogOpen] = useState(false);
    const [isEnemyDialogOpen, setIsEnemyDialogOpen] = useState(false);
    // プレイヤーの位置を追跡するためのref
    const playerPositionRef = useRef({x: 0, y: 0});
    const [activeQuest, setActiveQuest] = useState<QuestType | null>(null);

    // ダイアログの状態が変更されたときに親コンポーネントに通知
    const isDialogOpen = isEnemyDialogOpen || isNpcDialogOpen;
    useEffect(() => {
        if (onDialogOpen) {
            onDialogOpen(isDialogOpen);
        }
    }, [isDialogOpen, onDialogOpen]);

    // NpcTestからダイアログの状態を受け取るハンドラー
    const handleDialogStateChange = (isOpen: boolean) => {
        console.log("isOpen" + isOpen)
        setINpcDialogOpen(isOpen);
    };

    // EnemyTest 用のダイアログ状態変更ハンドラー
    const handleEnemyDialogStateChange = (isOpen: boolean) => {
        console.log("EnemyTest ダイアログ状態変更:", isOpen);
        setIsEnemyDialogOpen(isOpen);
    };

    // クエスト受注処理を行うハンドラ
    useEffect(() => {
        const fetchQuest = async () => {
            try {
                // クエスト受注処理を実行
                const response = await DSCQuest(playerId.id);
                console.log("クエスト受注結果:", response);

                // クエスト情報を状態に保存
                setActiveQuest(response);

            } catch (error) {
                console.error("クエスト受注中にエラーが発生しました:", error);
            }
        }
        fetchQuest()
    }, []);

    // クエスト受注処理を行うハンドラ
    const handleQuestTrigger = async (npcId: number, questId: number) => {
        console.log(`NPC ID: ${npcId}からクエスト ID: ${questId}の受注がトリガーされました`);

        try {
            // クエスト受注処理を実行
            const response = await firstQuest(playerId.id);
            console.log("クエスト受注結果:", response);

            // クエスト情報を状態に保存
            setActiveQuest(response);

        } catch (error) {
            console.error("クエスト受注中にエラーが発生しました:", error);
        }
    };

    // NpcTest からの通知を受け取るためのハンドラー
    const handleAlert = () => {

        if (activeQuest) {

            toast.info(` ${activeQuest.quest.name} - ${activeQuest.quest.description}`, {
                position: "top-right",
                autoClose: 5000, // 3秒後に自動で閉じる
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setIsAlertTriggered(true);
            setActiveQuest(activeQuest)
        }
    };

    const handleNextQuest = async (currentQuestId: number) => {
        try {
            // サーバーから次のクエストを取得
            const nextQuest = await getNextQuest(currentQuestId, playerId.id);

            // クエスト情報を状態に保存
            setActiveQuest(nextQuest);

            // 通知を表示
            toast.info(`次のクエスト: ${nextQuest.quest.name} - ${nextQuest.quest.description}`, {
                position: "top-right",
                autoClose: 3000, // 3秒後に自動で閉じる
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

        } catch (error) {
            console.error("次のクエスト取得中にエラーが発生しました:", error);
        }
    };


    // useEffect(() => {
    //     console.log("items" + JSON.stringify(items))
    // }, [items]); // itemsが変更されたときに実行されるように修正

    // map上からItemを削除する
    useEffect(() => {
        socket?.on('itemRemoved', (itemId) => {
            console.log('マップ上から削除:', itemId);
            setItems(prevItems =>
                prevItems ? prevItems.filter(item => item.id !== itemId) : null
            );
        });

        return () => {
            socket?.off('itemRemoved');
        };
    }, [socket]);


    useEffect(() => {
        socket?.on('itemPlaced', (itemData) => {
            console.log('New item placed:', itemData);
            // 新しいアイテムの画像をプリロード
            const img = new Image();
            img.src = itemData.iconImage;
            img.onload = () => {
                // 画像がロードされたら、参照を保存してからアイテムを追加
                imagesRef.current[itemData.id] = img;
                setLoadedImages(prev => ({...prev, [itemData.id]: true}));
                setItems(prevItems => [...(prevItems || []), itemData]);
            };
        });
        const fetchItems = async () => {
            const response = await fetch('/api/items');
            const data = await response.json();
            setItems([...data.items]); // 新しい配列を生成して更新
        };

        fetchItems();
        return () => {
            socket?.off('itemPlaced');
            socket?.off('itemRemoved');
        };
    }, [socket]);


    const handleItemDelete = (itemId: string) => {
        console.log("delete", itemId);
        setItems(prevItems =>
            prevItems ? prevItems.filter(item => item.id !== itemId) : null
        );
    }
    useEffect(() => {
        console.log("アイテムリストの更新" + objectItemImage?.map((item) => {
            item.x , item.y
        }));
        setItems(objectItemImage); // 外部から渡された最新のアイテムリストを反映
    }, [objectItemImage]);

    // カメラ位置の更新をリファクタリング
    useEffect(() => {
        // プレイヤーの位置が変わったら参照を更新
        if (ECollisionPosition) {
            playerPositionRef.current = {
                x: ECollisionPosition.x,
                y: ECollisionPosition.y
            };
        }

        // カメラ位置を更新
        if (ECollisionPosition) {
            // ウィンドウサイズを取得
            const windowWidth = typeof window !== "undefined" ? window.innerWidth : 800;
            const windowHeight = typeof window !== "undefined" ? window.innerHeight : 600;

            // プレイヤーが画面中央に来るようにカメラ位置を計算
            const newCameraX = ECollisionPosition.x - (windowWidth / 2) + (Tile_size / 2);
            const newCameraY = ECollisionPosition.y - (windowHeight / 2) + (Tile_size / 2);

            // カメラ位置を更新
            setCameraPosition({
                x: Math.max(0, newCameraX),  // 負の値にならないように
                y: Math.max(0, newCameraY)   // 負の値にならないように
            });
        }
    }, [ECollisionPosition]);

    // タブ切り替え時にカメラ位置をリセット
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // タブが表示された時、保存していたプレイヤー位置を使ってカメラを更新
                const { x, y } = playerPositionRef.current;

                // ウィンドウサイズを取得
                const windowWidth = typeof window !== "undefined" ? window.innerWidth : 800;
                const windowHeight = typeof window !== "undefined" ? window.innerHeight : 600;

                // プレイヤーが画面中央に来るようにカメラ位置を計算
                const newCameraX = x - (windowWidth / 2) + (Tile_size / 2);
                const newCameraY = y - (windowHeight / 2) + (Tile_size / 2);

                // カメラ位置を更新
                setCameraPosition({
                    x: Math.max(0, newCameraX),
                    y: Math.max(0, newCameraY)
                });
            }
        };

        // visibilitychange イベントリスナーを追加
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // クリーンアップ関数
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

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
    const [localNpcData, setLocalNpcData] = useState<NPC[] | null>(npcData);

    useEffect(() => {
        setLocalEnemyData(enemyData);
    }, [enemyData]);
    useEffect(() => {
        setLocalNpcData(npcData);
    }, [npcData]);
    // 敵を削除する関数

    const handleRemoveEnemy = (enemyId: number) => {
        // ローカルの状態を更新
        setLocalEnemyData(prev => prev ? prev.filter(enemy => enemy.id !== enemyId) : null);
    };

    const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});

    // 他のプレイヤーのアイコン画像をロード
    useEffect(() => {
        const loadImages = async () => {
            const imageMap: { [key: string]: HTMLImageElement } = {};


            players.forEach((player) => {
                if (player.player?.character?.[0]?.iconImage?.[0]) {
                    const imageUrl = player.player.character[0].iconImage[0];
                    const img = new window.Image();
                    img.src = imageUrl;
                    imageMap[player.playerId] = img;
                }
            });

            setImages(imageMap);
        };

        if (players.length > 0) {
            loadImages();
        }
    }, [players]);

    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [musicList, setMusicList] = useState<string[]>([]);
    const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.5); // 初期音量: 0.5（50%）
    const [isPlaying, setIsPlaying] = useState(false); // 再生状態を管理

    // Supabaseから音楽リストを取得
    useEffect(() => {
        const fetchMusicList = async () => {
            try {
                const { data, error } = await supabase.storage
                    .from("hackathon2-picture-storage")
                    .list("bgm/mapVolOne"); // フォルダパスを指定

                if (error) {
                    console.error("音楽リストの取得に失敗しました:", error.message);
                    return;
                }

                if (data) {
                    const musicFiles = data.map((file) => file.name);
                    setMusicList(musicFiles);

                    // 自動再生のため最初の曲を選択
                    if (musicFiles.length > 0) {
                        setSelectedMusic(musicFiles[0]);
                    }
                }
            } catch (err) {
                console.error("音楽リストの取得中にエラーが発生しました:", err);
            }
        };

        fetchMusicList();
    }, []);

    // 選択された音楽を再生
    useEffect(() => {
        if (selectedMusic) {
            const fetchAndPlayMusic = async () => {
                try {
                    const { data, error } = await supabase.storage
                        .from("hackathon2-picture-storage")
                        .createSignedUrl(`bgm/mapVolOne/${selectedMusic}`, 60 * 60); // フルパスを指定して署名付きURLを生成

                    if (error) {
                        console.error("音楽ファイルの取得に失敗しました:", error.message);
                        return;
                    }

                    if (data?.signedUrl) {
                        if (audio) {
                            audio.pause();
                            audio.currentTime = 0;
                        }

                        const newAudio = new Audio(data.signedUrl);
                        newAudio.loop = true; // ループ再生
                        newAudio.volume = Math.max(0, Math.min(volume, 1)); // 音量を制限

                        // 自動再生を試みる
                        newAudio
                            .play()
                            .catch((err) => {
                                console.error("音楽の再生中にエラーが発生しました:", err);
                            });

                        setAudio(newAudio);
                        setIsPlaying(true); // 再生状態を更新
                    }
                } catch (err) {
                    console.error("音楽ファイルの取得中にエラーが発生しました:", err);
                }
            };

            fetchAndPlayMusic();
        }

        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, [selectedMusic]);


    // 音量変更時の処理
    useEffect(() => {
        if (audio) {
            audio.volume = volume;
        }
    }, [volume, audio]);

    // ウィンドウのリサイズ時にカメラ位置を更新
    useEffect(() => {
        const handleResize = () => {
            // プレイヤーの現在位置を取得
            const { x, y } = playerPositionRef.current;

            // ウィンドウサイズを取得
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // プレイヤーが画面中央に来るようにカメラ位置を計算
            const newCameraX = x - (windowWidth / 2) + (Tile_size / 2);
            const newCameraY = y - (windowHeight / 2) + (Tile_size / 2);

            // カメラ位置を更新
            setCameraPosition({
                x: Math.max(0, newCameraX),
                y: Math.max(0, newCameraY)
            });
        };

        // リサイズイベントリスナーを追加
        window.addEventListener('resize', handleResize);

        // クリーンアップ関数
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div>
            <ToastContainer/>

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
                        </>
                    )}
                    {players
                        .filter((player) => player.playerId !== playerId.playerId)
                        .map((player, index) => (
                            <KonvaImage
                                key={player.playerId || `player-${index}`}
                                x={player.x - cameraPosition.x}
                                y={player.y - cameraPosition.y}
                                width={Tile_size}
                                height={Tile_size}
                                image={images[player.playerId]} // プレイヤーごとの画像
                            />
                        ))}

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


                    {Array.isArray(localEnemyData) && localEnemyData.length > 0 && (
                        <EnemyTest
                            socket={socket}
                            enemyData={localEnemyData}
                            cameraPosition={cameraPosition}
                            ECollisionPosition={ECollisionPosition}
                            onEnemyRemove={handleRemoveEnemy}
                            player={playerId}  // プレイヤー情報を渡す
                            playerAttack={playerId.attack}
                            activeQuest={activeQuest}
                            onNextQuest={handleNextQuest}
                            onDialogOpen={handleEnemyDialogStateChange}
                            isAlertTriggered={isAlertTriggered}
                            onPlayerDamage={(newHp) => {
                                // プレイヤーのHPが更新されたときの処理
                                console.log(`プレイヤーのHPが${newHp}に更新されました`);
                                // ここで必要に応じて親コンポーネントに通知できます
                            }}
                        />
                    )}

                    {Array.isArray(localNpcData) && localNpcData.length > 0 && (
                        <NpcTest
                            npcData={localNpcData}
                            cameraPosition={cameraPosition}
                            onDialogOpen={handleDialogStateChange}
                            player={playerId}
                            onNextQuest={handleNextQuest}
                            onQuestTrigger={handleQuestTrigger}
                            onAlert={handleAlert}
                            activeQuest={activeQuest}
                        />
                    )}


                    {musicList.map((music, index) => (
                        <React.Fragment key={index}>
                            {/* 背景を描画（選択状態の場合は色を変更） */}
                            <Rect
                                x={20}
                                y={20 + index * 40}
                                width={300}
                                height={100}
                                fill={selectedMusic === music ? "#ffffff80" : "#444"}
                                cornerRadius={9}
                                stroke="black"
                                strokeWidth={1}
                                onClick={() => setSelectedMusic(music)} // 音楽を選択する
                                shadowColor="rgba(0,0,0,0.2)"
                                shadowBlur={10}
                                shadowOffset={{ x: 0, y: 5 }}
                                shadowOpacity={2}
                            />
                            {/* 音楽名を描画 */}
                            <Text
                                x={40}
                                y={37 + index * 40}
                                text={music}
                                fontSize={16}
                                fill="black"
                                onClick={() => setSelectedMusic(music)} // 音楽を選択する
                            />
                        </React.Fragment>
                    ))}
                    <Text x={110} y={60} text="音量" fontSize={16} fill="black" />
                    {/* <Line
                        points={[100, 100, 310, 100]} // スライダーのベースライン
                        stroke="#e0e0ff"
                        strokeWidth={30}
                        corner
                    /> */}
                    <Rect 
                        x={100}
                        y={80}
                        width={210}
                        height={30}
                        fill="#e0e0ff80"
                        cornerRadius={30}
                        stroke="black"
                        strokeWidth={1}
                        shadowColor="rgba(0,0,0,0.2)"
                        shadowBlur={10}
                        shadowOffset={{ x: 0, y: 5 }}
                        shadowOpacity={2}
                        />
                    <Rect
                        x={105 + volume * 180} // 音量に応じてスライダーの位置を調整
                        y={85}
                        width={20}
                        height={20}
                        fill="#fff"
                        draggable
                        cornerRadius={30}
                        shadowColor="rgba(0,0,0,0.2)"
                        shadowBlur={10}
                        shadowOffset={{ x: 0, y: 5 }}
                        shadowOpacity={2}
                        dragBoundFunc={(pos) => {
                            // ドラッグ範囲を制限
                            const x = Math.max(105, Math.min(pos.x, 280));
                            return { x, y: 85 };
                        }}
                        onDragMove={(e) => {
                            // スライダーを移動したときに音量を更新
                            // dragBoundFuncで制限された後の位置を使用
                            const x = Math.max(105, Math.min(e.target.x(), 280));
                            const newVolume = (x - 105) / 180;
                            setVolume(Math.max(0, Math.min(newVolume, 1))); // 音量を制限
                        }}
                    />
                    <Rect
                        x={40}
                        y={60}
                        width={50}
                        height={50}
                        fill={isPlaying ? "#ffc6e2bb" : "#e0e0e0bb"} // 再生中なら赤、停止中なら緑
                        cornerRadius={30}
                        stroke="black"
                        strokeWidth={1}
                        shadowColor="rgba(0,0,0,0.2)"
                        shadowBlur={10}
                        shadowOffset={{ x: 0, y: 5 }}
                        shadowOpacity={2}
                        onClick={() => {
                            if (audio) {
                                if (isPlaying) {
                                    audio.pause(); // 音楽を停止
                                } else {
                                    audio.play().catch((err) => {
                                        console.error("音楽の再生中にエラーが発生しました:", err);
                                    }); // 音楽を再生
                                }
                                setIsPlaying(!isPlaying); // 再生状態を切り替え
                            }
                        }}
                    />
                    <Text
                        x={58}
                        y={78}
                        text={isPlaying ? "I I" : "▶"}
                        fontSize={16}
                        fill="#3E4042"
                        onClick={() => {
                            if (audio) {
                                if (isPlaying) {
                                    audio.pause();
                                } else {
                                    audio.play().catch((err) => {
                                        console.error("音楽の再生中にエラーが発生しました:", err);
                                    });
                                }
                                setIsPlaying(!isPlaying);
                            }
                        }}
                    />
                </Layer>
            </Stage>
        </div>
    );
}


export default MapVolOne;
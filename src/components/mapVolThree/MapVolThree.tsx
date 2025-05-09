import React, {useState, useEffect, useRef} from "react";

import useGenerateMap from "@/hooks/(realTime)/2D/2DMap/firstMapGenerateTile/useGenerateMapSnow";
import {PlayerItem} from "@/types/playerItem";
import {Map_data, Tile_size} from "@/components/(konva)/snowmap/mapData";
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
    onItemRemove?: (enemyId: string) => void
}

const MapVolThree: React.FC<mapVolOneTypes> = ({
                                                 playerId,
                                                 ECollisionPosition,
                                                 playerCharacter,
                                                 objectItemImage,
                                                 nearbyItemPosition,
                                                 enemyData,
                                                 socket,
                                                 players,
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
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});

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
            socket.off('itemPlaced');
            socket.off('itemRemoved');
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

    // カメラの位置を更新
    useEffect(() => {
        setCameraPosition({ x: playerId.x, y: playerId.y });
    }, [playerId]);

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


    return (
        <div>
            <Stage
                width={typeof window !== "undefined" ? window.innerWidth : 0}
                height={typeof window !== "undefined" ? window.innerHeight : 0}
                onContextMenu={handleStageContextMenu}
            >
                <Layer>
                    {/* --- 1. Snow背景 --- */}
                    {Map_data.map((row, rowIndex) =>
                        row.map((_, colIndex) => {
                            const snowImg = tileImages["snow"];
                            if (!snowImg) return null;
                            return (
                                <KonvaImage
                                    key={`snow-${rowIndex}-${colIndex}`}
                                    image={snowImg}
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
                    {Array.isArray(localEnemyData) && localEnemyData.length > 0 && (
                        <EnemyTest
                            socket={socket}
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

                    {musicList.map((music, index) => (
                        <React.Fragment key={index}>
                            {/* 背景を描画（選択状態の場合は色を変更） */}
                            <Rect
                                x={20}
                                y={20 + index * 40}
                                width={300}
                                height={30}
                                fill={selectedMusic === music ? "lightblue" : "white"}
                                stroke="black"
                                strokeWidth={1}
                                onClick={() => setSelectedMusic(music)} // 音楽を選択する
                            />
                            {/* 音楽名を描画 */}
                            <Text
                                x={25}
                                y={25 + index * 40}
                                text={music}
                                fontSize={16}
                                fill="black"
                                onClick={() => setSelectedMusic(music)} // 音楽を選択する
                            />
                        </React.Fragment>
                    ))}
                    {musicList.map((music, index) => (
                        <React.Fragment key={index}>
                            {/* 背景を描画（選択状態の場合は色を変更） */}
                            <Rect
                                x={20}
                                y={20 + index * 40}
                                width={300}
                                height={30}
                                fill={selectedMusic === music ? "lightblue" : "white"}
                                stroke="black"
                                strokeWidth={1}
                                onClick={() => setSelectedMusic(music)} // 音楽を選択する
                            />
                            {/* 音楽名を描画 */}
                            <Text
                                x={25}
                                y={25 + index * 40}
                                text={music}
                                fontSize={16}
                                fill="black"
                                onClick={() => setSelectedMusic(music)} // 音楽を選択する
                            />
                        </React.Fragment>
                    ))}
                    <Text x={20} y={200} text="音量" fontSize={16} fill="black" />
                    <Line
                        points={[20, 230, 220, 230]} // スライダーのベースライン
                        stroke="black"
                        strokeWidth={2}
                    />
                    <Rect
                        x={20 + volume * 200 - 5} // 音量に応じてスライダーの位置を調整
                        y={220}
                        width={10}
                        height={20}
                        fill="blue"
                        draggable
                        dragBoundFunc={(pos) => {
                            // ドラッグ範囲を制限
                            const x = Math.max(20, Math.min(pos.x, 220));
                            return { x, y: 220 };
                        }}
                        onDragMove={(e) => {
                            // スライダーを移動したときに音量を更新
                            const newVolume = (e.target.x() - 20) / 200;
                            setVolume(Math.max(0, Math.min(newVolume, 1))); // 音量を制限
                        }}
                    />
                    <Rect
                        x={20}
                        y={280}
                        width={100}
                        height={30}
                        fill={isPlaying ? "red" : "green"} // 再生中なら赤、停止中なら緑
                        stroke="black"
                        strokeWidth={1}
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
                        x={25}
                        y={285}
                        text={isPlaying ? "停止" : "再生"}
                        fontSize={16}
                        fill="white"
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


export default MapVolThree;
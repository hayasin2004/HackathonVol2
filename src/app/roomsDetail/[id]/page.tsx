"use client"
// pages/rooms/[id].tsx
import React, {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Game from "../../../components/(realTime)/game/Game";
import {useSession} from "next-auth/react";
import {PlayerItem} from "@/types/playerItem";
import {defaultItem} from "@/types/defaultItem";
//マップの追加✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨↓
import MapWithCharacter from "@/components/(konva)/grassmap/Grassmap";
import MapWithCharacterDesert from '@/components/(konva)/desertmap/Desertmap';
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";

type MapType = "roomsDetail/2" | "roomsDetail/3";

// マップ遷移ポイントの型定義
interface TransitionPoint {
    sourceX: number;
    sourceY: number;
    targetMap: MapType;
    targetX: number;
    targetY: number;
}

//マップの追加✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨↑

const RoomPage = ({params}: { params: { id: string } }) => {
    const router = useRouter();
    const id = params?.id
    const roomId = Number(id);
    const {data: session} = useSession()

    console.log("roomId: " + roomId)

    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<PlayerItem | null | undefined>(null);
    const [itemData, setItemData] = useState<defaultItem[]>([]);

    //マップの追加✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨↓
    // 現在のURLからマップタイプを決定する
    const determineMapFromURL = () => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.includes('roomsDetail/3')) {
                return "roomsDetail/3";
            }
            return "roomsDetail/2"; // デフォルト
        }
        return "roomsDetail/2"; // SSRのケース
    };

    const [currentMap, setCurrentMap] = useState<MapType>("roomsDetail/2");

    // 前回のマップとその時の座標を記録
    const [previousMap, setPreviousMap] = useState<{
        map: MapType;
        x: number;
        y: number;
    } | null>(null);

    // コンポーネントマウント時に現在のURLからマップタイプを設定
    useEffect(() => {
        const mapType = determineMapFromURL();
        setCurrentMap(mapType);

        // URLから直接アクセスした場合に初期位置を設定
        if (playerId && mapType !== currentMap) {
            setInitialPositionForMap(mapType);
        }
    }, []);

    // マップごとの初期位置を設定
    const setInitialPositionForMap = (mapType: MapType) => {
        if (!playerId) return;

        let newPosition;

        if (mapType === "roomsDetail/2") {
            // Map 2の初期位置
            if (previousMap?.map === "roomsDetail/3") {
                // Map 3から来た場合は、Map 3での最後の位置に基づいて配置
                newPosition = { x: 4032 - 64, y: previousMap.y };
            } else {
                // 新規アクセスの場合はデフォルト位置
                newPosition = { x: 2000, y: 640 }; // マップ2の中央付近
            }
        } else if (mapType === "roomsDetail/3") {
            // Map 3の初期位置
            if (previousMap?.map === "roomsDetail/2") {
                // Map 2から来た場合は、Map 2での最後の位置に基づいて配置
                newPosition = { x: 64, y: previousMap.y };
            } else {
                // 新規アクセスの場合はデフォルト位置
                newPosition = { x: 500, y: 640 }; // マップ3の中央付近
            }
        }

        if (newPosition) {
            setPlayerId({...playerId, ...newPosition});
        }
    };

    // マップ遷移ポイントの定義
    // Roomsに戻る遷移を定義する
    const mapTransitionPoints: Record<MapType, TransitionPoint[]> = {
        "roomsDetail/2": [
            // マップ2からマップ3への遷移ポイント
            { sourceX: 4032, sourceY: 576, targetMap: "roomsDetail/3", targetX: 64, targetY: 576 },
            { sourceX: 4032, sourceY: 640, targetMap: "roomsDetail/3", targetX: 64, targetY: 640 },
            { sourceX: 4032, sourceY: 704, targetMap: "roomsDetail/3", targetX: 64, targetY: 704 },
        ],
        "roomsDetail/3": [
            // マップ3からマップ2への遷移ポイント
            { sourceX: 0, sourceY: 576, targetMap: "roomsDetail/2", targetX: 4032 - 64, targetY: 576 },
            { sourceX: 0, sourceY: 640, targetMap: "roomsDetail/2", targetX: 4032 - 64, targetY: 640 },
            { sourceX: 0, sourceY: 704, targetMap: "roomsDetail/2", targetX: 4032 - 64, targetY: 704 },
        ]
    };

    // マップ遷移追跡用のステート
    const [lastTransitionTime, setLastTransitionTime] = useState<number>(0);

    // 座標を踏んだらマップを自動で切り替える useEffect
    useEffect(() => {
        if (!playerId) return;

        const playerX = playerId.x;
        const playerY = playerId.y;
        const currentTime = Date.now();
        const cooldownPeriod = 500; // ミリ秒単位でのクールダウン時間

        // デバッグ情報を出力
        console.log(`現在のプレイヤー座標: (${playerX}, ${playerY}), 現在のマップ: ${currentMap}`);

        // クールダウン中なら処理しない（連続した遷移を防止）
        if (currentTime - lastTransitionTime < cooldownPeriod) {
            return;
        }

        try {
            // 現在のマップの遷移ポイントをチェック
            const transitionPoints = mapTransitionPoints[currentMap];
                for (const point of transitionPoints) {
                // 遷移ポイントの近くにいるかチェック
                if (Math.abs(playerX - point.sourceX) < 10 && Math.abs(playerY - point.sourceY) < 10) {
                    console.log(`遷移ポイント発動: ${currentMap} から ${point.targetMap} へ`, point);

                    // 現在のマップと位置を記録
                    setPreviousMap({
                        map: currentMap,
                        x: playerX,
                        y: playerY
                    });

                    // 新しい位置を設定
                    const newPlayer = {...playerId, x: point.targetX, y: point.targetY};
                    setPlayerId(newPlayer);

                    // マップを切り替え
                    setTimeout(() => {
                        router.push(`/${point.targetMap}`);
                        setCurrentMap(point.targetMap);
                        console.log(`マップを ${point.targetMap} に変更しました`);
                    }, 50);

                    setLastTransitionTime(currentTime);
                    return;
                }
            }
        } catch (error) {
            console.error("マップ遷移中にエラーが発生しました:", error);
        }
    }, [playerId?.x, playerId?.y, currentMap, router]);


    //マップの追加✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨↑

    // 現在のユーザーIDを取得（認証システムから取得する想定）
    useEffect(() => {
        // ここでは仮の実装として、LocalStorageなどから取得するか、
        // クエリパラメータから取得する方法を示します
        const userId = session?.user.id
        console.log("userId:", userId);
        // const NumUserId = Number(1)
        if (userId) {
            const currentUserId = async () => {
                const ItemResponse = await fetch(`/api/item/fetchItem`, {method: "GET"});
                const response = await fetch(`/api/player/catch/${userId}`, {method: "GET"});
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text(); // レスポンスをテキストとして取得
                const data = text ? JSON.parse(text) : null; // 空チェックとJSONパース
                const userData = JSON.parse(JSON.stringify(data.playerData))

                const itemDataList = await ItemResponse.json()
                console.log("ユーザーデータ:", userData)

                // ユーザーデータを設定
                setPlayerId(userData);

                // マップに合わせて初期位置を設定
                setInitialPositionForMap(currentMap);

                setItemData(itemDataList);
            }
            currentUserId()
        } else {
            // デモ用に仮のプレイヤーIDを生成
            return;
        }
    }, [id, session, currentMap]);

    // ルーム情報の取得
    useEffect(() => {
        if (!roomId || isNaN(roomId)) return;

        const fetchRoomDetails = async () => {
            try {
                const response = await fetch(`/api/rooms/${roomId}`, {method: "GET"});

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text(); // レスポンスをテキストとして取得
                const data = text ? JSON.parse(text) : null; // 空チェックとJSONパース

                if (data && data.status === 'success') {
                    setRoom(data.room);
                } else {
                    setError(data?.message || 'ルーム情報の取得に失敗しました');
                }
            } catch (error) {
                console.error('Error fetching room details:', error);
                setError('ルーム情報の取得中にエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };
        fetchRoomDetails();
    }, [roomId]);

    // プレイヤーデータを初期化
    useEffect(() => {
        if (!playerId || !roomId || isNaN(roomId)) return;

        const initializePlayerData = async () => {
            try {
                console.log("プレイヤーデータの確認")
                const checkResponse = await fetch(`/api/player/check?playerId=${playerId.id}`, {method: "GET"});
                const checkData = await checkResponse.json();

                // if (checkData.status === 'success' && checkData.exists) {
                // プレイヤーが存在する場合は、ルームを更新
                //     await fetch(`/api/player/updateRoom`, {
                //         method: 'POST',
                //         headers: {
                //             'Content-Type': 'application/json'
                //         },
                //         body: JSON.stringify({playerId, roomId})
                //     });
                // } else {
                //     // プレイヤーが存在しない場合は、作成
                //     await fetch(`/api/player/create`, {
                //         method: 'POST',
                //         headers: {
                //             'Content-Type': 'application/json'
                //         },
                //         body: JSON.stringify({playerId, roomId})
                //     });
                // }
            } catch (error) {
                console.error('Error initializing player data:', error);
                setError('プレイヤーデータの初期化に失敗しました');
            }
        };

        initializePlayerData();
    }, [playerId, roomId]);

    // マップ位置情報を永続化
    useEffect(() => {
        // プレイヤー位置情報をローカルストレージに保存
        if (playerId) {
            localStorage.setItem(`player_position_${currentMap}`, JSON.stringify({
                x: playerId.x,
                y: playerId.y,
                map: currentMap
            }));
        }
    }, [playerId?.x, playerId?.y, currentMap]);

    // マップ遷移時、ローカルストレージから前回の位置を復元
    const restorePlayerPosition = () => {
        try {
            const savedPosition = localStorage.getItem(`player_position_${currentMap}`);
            if (savedPosition && playerId) {
                const position = JSON.parse(savedPosition);
                // プレイヤー位置を復元(もし存在すれば)
                setPlayerId({...playerId, x: position.x, y: position.y});
                return true;
            }
        } catch (error) {
            console.error("プレイヤー位置の復元に失敗:", error);
        }
        return false;
    };

    // マップ切り替え時の位置指定
    const handleMapChange = (newMap: MapType, newX: number, newY: number) => {
        if (!playerId) return;

        // 現在の位置を記録
        setPreviousMap({
            map: currentMap,
            x: playerId.x,
            y: playerId.y
        });

        // 新しい位置を設定
        setPlayerId({...playerId, x: newX, y: newY});

        // マップ切り替え
        router.push(`/${newMap}`);
        setCurrentMap(newMap);
    };

    if (loading) {
        return <LoadingScreen message='読み込み中'/>;
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                    <button
                        onClick={() => router.push('/rooms')}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        ルーム一覧に戻る
                    </button>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p>ルームが見つかりません</p>
                    <button
                        onClick={() => router.push('/rooms')}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        ルーム一覧に戻る
                    </button>
                </div>
            </div>
        );
    }

    if (!playerId) {
        return <LoadingScreen message='読み込み中'/>;
    }
    //
    // // マップ切り替え機能（デバッグ用）
    // const forceMapChange = () => {
    //     console.log("手動でマップを切り替えます");
    //     if (currentMap === "roomsDetail/2") {
    //         handleMapChange("roomsDetail/3", 64, playerId.y);
    //     } else {
    //         handleMapChange("roomsDetail/2", 4032 - 64, playerId.y);
    //     }
    // };
    //
    // // デバッグ用の位置変更機能
    // const setCustomPosition = () => {
    //     const x = parseInt(prompt("X座標を入力してください", playerId.x.toString()) || playerId.x.toString());
    //     const y = parseInt(prompt("Y座標を入力してください", playerId.y.toString()) || playerId.y.toString());
    //
    //     if (!isNaN(x) && !isNaN(y)) {
    //         setPlayerId({...playerId, x, y});
    //     }
    // };

    return (
        <div className="container mx-auto p-4">
            {/*マップの追加✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨↓*/}
            <div key={`map-container-${currentMap}`}>
                {currentMap === "roomsDetail/2" && (
                    <MapWithCharacter
                        playerId={playerId}
                        itemData={itemData}
                        roomId={roomId}
                    />
                )}
                {currentMap === "roomsDetail/3" && (
                    <MapWithCharacterDesert
                        playerId={playerId}
                        itemData={itemData}
                        roomId={roomId}
                    />
                )}
            </div>
            {/*マップの追加✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨↑*/}

            {/* デバッグ情報 - 開発中のみ表示 */}
            {/*<div className="fixed bottom-0 left-0 bg-black bg-opacity-70 text-white p-2 text-sm">*/}
            {/*    <div>マップ: {currentMap} | 座標: ({playerId.x}, {playerId.y})</div>*/}
            {/*    <div className="flex space-x-2 mt-1">*/}
            {/*        <button*/}
            {/*            onClick={forceMapChange}*/}
            {/*            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"*/}
            {/*        >*/}
            {/*            マップ切替テスト*/}
            {/*        </button>*/}
            {/*        <button*/}
            {/*            onClick={setCustomPosition}*/}
            {/*            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"*/}
            {/*        >*/}
            {/*            座標設定*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
};

export default RoomPage;
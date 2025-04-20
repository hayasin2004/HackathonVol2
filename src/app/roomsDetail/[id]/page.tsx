"use client"
// pages/rooms/[id].tsx
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Game from "../../../components/(realTime)/game/Game";
import {useSession} from "next-auth/react";
import {PlayerItem} from "@/types/playerItem";
import MapWithCharacter from "@/components/(konva)/grassmap/Grassmap";
import {defaultItem} from "@/types/defaultItem";
import MapDisplay from '@/components/MapDisplay';

const RoomPage = ({params}: { params: { id: string } }) => {
    const router = useRouter();
    const id = params?.id
    const roomId = Number(id);
    const {data: session} = useSession()

    console.log("これかな" + roomId)

    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<PlayerItem | null | undefined>(null);
    const [itemData, setItemData] = useState<defaultItem[]>([]);
    // 現在のユーザーIDを取得（認証システムから取得する想定）
    useEffect(() => {
        // ここでは仮の実装として、LocalStorageなどから取得するか、
        // クエリパラメータから取得する方法を示します
        const userId = session?.user.id
        console.log(userId);
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
                console.log(userData)
                setPlayerId(userData);
                setItemData(itemDataList);
            }
            currentUserId()
        } else {
            // デモ用に仮のプレイヤーIDを生成
            return;
        }
    }, [id, session]);

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

    if (loading) {
        return <div className="flex justify-center items-center h-screen">ルーム情報を読み込み中...</div>;
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
        return <div className="flex justify-center items-center h-screen">プレイヤー情報を読み込み中...</div>;
    }



    return (
        <div className="container mx-auto p-4">
            {/*<h1 className="text-2xl font-bold mb-4">{room.name}</h1>*/}

            {/*<div className="mb-6">*/}
            {/*    <button*/}
            {/*        onClick={() => router.push('/rooms')}*/}
            {/*        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2"*/}
            {/*    >*/}
            {/*        ルーム一覧に戻る*/}
            {/*    </button>*/}

            {/*    <div className="mt-2">*/}
            {/*        <p className="text-sm text-gray-500">*/}
            {/*            ルームID: {room.id} | プレイヤー数: {room.players.length}*/}
            {/*        </p>*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/* <MapWithCharacter playerId={playerId} itemData={itemData} roomId={roomId}/> */}
            <MapDisplay playerId={playerId} itemData={itemData} roomId={roomId}/>
            {/*<Game playerId={playerId} roomId={roomId}/>*/}
        </div>
    );
};

export default RoomPage;
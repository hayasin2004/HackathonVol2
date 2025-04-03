"use client"
// pages/rooms/index.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RoomsPage: React.FC = () => {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newRoomName, setNewRoomName] = useState('');
    const router = useRouter();

    // ルーム一覧の取得
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch('/api/rooms/roomCrud', {method : "GET"});
                const data = await response.json();

                if (data.status === 'success') {
                    setRooms(data.rooms);
                } else {
                    setError(data.message || 'ルーム情報の取得に失敗しました');
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
                setError('ルーム情報の取得中にエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    // 新規ルームの作成
    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newRoomName.trim()) {
            setError('ルーム名を入力してください');
            return;
        }

        try {
            const response = await fetch('/api/rooms/roomCrud', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newRoomName })
            });

            const data = await response.json();

            if (data.status === 'success') {
                // 作成したルームに遷移
                router.push(`/rooms/${data.room.id}`);
            } else {
                setError(data.message || 'ルームの作成に失敗しました');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            setError('ルーム作成中にエラーが発生しました');
        }
    };

    if (loading) {
        return <div>ルーム情報を読み込み中...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">ゲームルーム一覧</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            {/* 新規ルーム作成フォーム */}
            <div className="mb-8 p-4 bg-gray-100 rounded">
                <h2 className="text-xl font-semibold mb-4">新規ルームを作成</h2>
                <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="ルーム名"
                        className="flex-grow px-4 py-2 border rounded"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                    >
                        作成
                    </button>
                </form>
            </div>

            {/* ルーム一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.length > 0 ? (
                    rooms.map((room) => (
                        <div key={room.id} className="border rounded p-4 shadow-sm">
                            <h3 className="text-lg font-semibold">{room.name}</h3>
                            <p className="text-gray-600 mb-2">
                                プレイヤー: {room.players.length}人 |
                                アイテム: {room.items.length}個
                            </p>
                            <Link
                                href={`/rooms/${room.id}`}
                                className="block text-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-4"
                            >
                                参加する
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                        アクティブなルームがありません。新しいルームを作成してください。
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomsPage;
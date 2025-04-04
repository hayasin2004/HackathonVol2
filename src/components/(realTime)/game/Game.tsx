"use client"
// components/Game.tsx
import React, {useEffect, useState} from 'react';
import {useSocketConnection} from "@/hooks/(realTime)/connection/useScoketConnection";
import {usePlayerMovement} from "@/hooks/(realTime)/playerMovement/usePlayerMovement";
import {useSupabaseRealtime} from "@/hooks/(realTime)/supabaseRealTime/useSupabaseRealTime";
import {PlayerType} from "@/types/Player";
import {PlayerItem} from "@/types/playerItem";
import useRemakeItemGet from "@/hooks/(realTime)/test/useRemakeItemGet";

interface GameProps {
    playerId: PlayerItem;
    roomId: number;
}

const Game: React.FC<GameProps> = ({playerId, roomId}) => {
    // Socket.io接続
    const {socket, connected, players, items, error, movePlayer} = useSocketConnection(playerId.id, roomId);
    // プレイヤー移動
    const {ECollisionPosition, ECollisionStatus, adjacentObstacles} = useRemakeItemGet({
        userId: 1, // ユーザーID
        initialPosition: {x: playerId.x, y: playerId.y}, // 初期位置
        circleRadius: 30, // プレイヤーの範囲
        rectPositions: items,
        speed: 10, // 移動速度
        movePlayer
    });


    // Supabaseリアルタイムイベント
    const {itemEvents, craftEvents} = useSupabaseRealtime(roomId, playerId.id);

    // 現在のプレイヤー情報
    const currentPlayer = players.find(player => player.playerId === playerId.id);
    // ゲーム状態
    const [playerItems, setPlayerItems] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<string[]>([]);

    // プレイヤーアイテム情報の取得
    useEffect(() => {
        if (playerId) {
            fetch(`/api/player/getItems/${playerId.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setPlayerItems(data.items);
                    }
                })
                .catch(err => console.error('Failed to fetch player items:', err));
        }
    }, [playerId]);

    // アイテム取得イベントの処理
    useEffect(() => {
        if (itemEvents.length > 0) {
            const latestEvent = itemEvents[itemEvents.length - 1];
            if (latestEvent.player_id !== playerId.id) {
                // 他のプレイヤーのイベント
                setNotifications(prev => [
                    `プレイヤーID:${latestEvent.player_id}がアイテムを取得しました`,
                    ...prev.slice(0, 4)
                ]);
            } else {
                // 自分のイベント
                setNotifications(prev => [
                    `アイテムを取得しました`,
                    ...prev.slice(0, 4)
                ]);

                // プレイヤーのアイテムリストを更新
                if (latestEvent.data && latestEvent.data.playerItems) {
                    setPlayerItems(latestEvent.data.playerItems);
                }
            }
        }
    }, [itemEvents, playerId]);

    // アイテムクラフトイベントの処理
    useEffect(() => {
        if (craftEvents.length > 0) {
            const latestEvent = craftEvents[craftEvents.length - 1];
            if (latestEvent.player_id !== playerId.id) {
                // 他のプレイヤーのイベント
                setNotifications(prev => [
                    `プレイヤーID:${latestEvent.player_id}がアイテムをクラフトしました`,
                    ...prev.slice(0, 4)
                ]);
            } else {
                // 自分のイベント
                setNotifications(prev => [
                    `アイテムをクラフトしました`,
                    ...prev.slice(0, 4)
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
            const playerDataId = playerId.id

                const response = await fetch('/api/item/craftItem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({playerDataId, craftItemId})
                });

                const data = await response.json();

                if (data.status === 'success') {
                    setNotifications(prev => [
                        `アイテムをクラフトしました`,
                        ...prev.slice(0, 4)
                    ]);
                } else {
                    setNotifications(prev => [
                        `クラフト失敗: ${data.message}`,
                        ...prev.slice(0, 4)
                    ]);
                }

        } catch (error) {
            console.error('Craft error:', error);
            setNotifications(prev => [
                'クラフト中にエラーが発生しました',
                ...prev.slice(0, 4)
            ]);
        }
    };

    if (!connected) {
        return <div className="loading">サーバーに接続中...</div>;
    }

    if (error) {
        return <div className="error">エラー: {error}</div>;
    }

    return (
        <div className="game-container">
            <div className="game-world" style={{
                position: 'relative',
                width: '100%',
                height: '600px',
                border: '1px solid #333',
                overflow: 'hidden'
            }}>
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
                        />
                    ))}
                {/* 自分のプレイヤー */}

                <div
                    className="current-player"
                    style={{
                        position: 'absolute',
                        left: `${ECollisionPosition.x}px`,
                        top: `${ECollisionPosition.y}px`,
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'red',
                        zIndex: 20
                    }}
                />

                {/* アイテム */}
                {items.map(item => (
                    <div
                        key={item.id}
                        className="item"
                        style={{
                            position: 'absolute',
                            left: `${item.x}px`,
                            top: `${item.y}px`,
                            width: `${item.item.width || 10}px`,
                            height: `${item.item.height || 10}px`,
                            backgroundColor: 'gold',
                            zIndex: 5
                        }}
                    />
                ))}
            </div>

            {/* 通知エリア */}
            <div className="notifications" style={{margin: '10px 0'}}>
                <h3>通知</h3>
                <ul>
                    {notifications.map((notification, index) => (
                        <li key={index}>{notification}</li>
                    ))}
                </ul>
            </div>

            {/* インベントリ */}
            <div className="inventory">
                <h3>インベントリ</h3>
                <div className="items-grid"
                     style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px'}}>
                    {playerItems.map((item) => (
                        <div key={item.id} className="item-box" style={{border: '1px solid #ccc', padding: '5px'}}>
                            <div>{item.DefaultItemList?.itemName || `アイテム#${item.itemId}`}</div>
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
                    <button onClick={() => handleCraftItem(1)}>アイテム1をクラフト</button>
                    <button onClick={() => handleCraftItem(2)}>アイテム2をクラフト</button>
                </div>
            </div>
        </div>
    );
};

export default Game;
import {useCallback} from "react";
import {Socket} from "socket.io-client";
const useDestroyAndRandom = (socket: Socket | null) => {
    const maxWidth = 2200;
    const maxHeight = 2200;
    const tileSize = 64;

    const getRandomPosition = useCallback((existingPositions) => {
        let position;
        let isOverlapping; // 重複を確認するフラグ
        do {
            const x = Math.floor(Math.random() * (maxWidth / tileSize)) * tileSize;
            const y = Math.floor(Math.random() * (maxHeight / tileSize)) * tileSize;
            position = {x, y};

            // 重複を確認するロジック
            isOverlapping = existingPositions.some(pos => {
                const isXOverlap = Math.abs(pos.x - position.x) < tileSize;
                const isYOverlap = Math.abs(pos.y - position.y) < tileSize;
                return isXOverlap && isYOverlap;
            });
        } while (isOverlapping); // 重複している場合は再度位置を生成
        return position;
    }, [maxWidth, maxHeight, tileSize]);

    const handleItemCollection = useCallback(async (item) => {
        try {
            console.log("ランダム座標対象アイテム" + JSON.stringify(item))
            if (item.itemId === 11) { // 11が水のIDであると仮定
                console.log('Water item detected, not moving.');
                return;
            }
            const existingPositions = []; // 他のアイテムの座標を取得する必要があります

            const newPosition = getRandomPosition(existingPositions);

            // まずアイテムを削除
            if (socket) {
                socket.emit('itemRemoved', {
                    id: item.id,
                    itemId: item.itemId
                });
            }

            // データベースでアイテム位置を更新
            const response = await fetch('/api/item/updateItemPosition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: item?.itemId,
                    newPosition,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update item position');
            }

            const updatedItem = await response.json();
            console.log('Updated item position:', updatedItem);

            // 画像URLの処理
            let iconImage;
            if (typeof item.iconImage === 'string') {
                iconImage = item.iconImage;
            } else if (Array.isArray(item.iconImage) && item.iconImage.length > 0) {
                iconImage = item.iconImage[0];
            } else {
                iconImage = ''; // デフォルト値
                console.warn('iconImage is missing or invalid:', item.iconImage);
            }

            const newItemData = {
                ...item,
                x: newPosition.x,
                y: newPosition.y,
                id: item.id,
                iconImage: iconImage
            };

            // 少し遅延を入れて、削除イベントが先に処理されるようにする
            setTimeout(() => {
                if (socket) {
                    socket.emit('placeItem', newItemData);
                    console.log('Emitted placeItem event with data:', newItemData);
                } else {
                    console.warn('Socket is not connected, cannot emit placeItem event');
                }
            }, 300); // 300msの遅延

        } catch (error) {
            console.error("Failed to update item position:", error);
        }
    }, [getRandomPosition, socket]);

    const playerItemCollection = useCallback(async (item) => {
        try {
            console.log("プレイヤーが取得したアイテム:", JSON.stringify(item));



            // マップ上からアイテムを非表示にする（リアルタイム処理）
            if (socket) {
                socket.emit('itemRemoved', {
                    id: item.id,
                    itemId: item.itemId
                });
                console.log('アイテムが取得されたためマップから非表示にしました:', JSON.stringify(item));
            } else {
                console.warn('Socket is not connected, cannot emit itemRemoved event');
            }

            // データベースからアイテムを削除
            const response = await fetch('/api/item/removePlayerItem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: item,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from database');
            }

            const result = await response.json();
            console.log('アイテムがデータベースから削除されました:', result);

        } catch (error) {
            console.error("Failed to remove item:", error);
        }
    }, [socket]);


    return {handleItemCollection ,playerItemCollection};
};

export default useDestroyAndRandom;
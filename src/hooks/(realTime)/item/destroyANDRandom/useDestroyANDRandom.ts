import {useCallback} from "react";
import {Socket} from "socket.io-client";
import {response} from "express";

const useDestroyAndRandom = (socket: Socket | null) => {
    const maxWidth = 2200;
    const maxHeight = 2200;
    const tileSize = 64;

    const getRandomPosition = useCallback((existingPositions) => {
        let position;
        do {
            const x = Math.floor(Math.random() * (maxWidth / tileSize)) * tileSize;
            const y = Math.floor(Math.random() * (maxHeight / tileSize)) * tileSize;
            position = {x, y};
        } while (existingPositions.some(pos => pos.x === position.x && pos.y === position.y));
        return position;
    }, [maxWidth, maxHeight, tileSize]);

    // アイテムを引数として受け取るように変更
    const handleItemCollection = useCallback(async (item) => {
        try {
            console.log("ランダム座標対象アイテム" + JSON.stringify(item))
            if (item.itemId === 11) { // 11が水のIDであると仮定
                console.log('Water item detected, not moving.');
                return;
            }
            const existingPositions = []; // Fetch existing positions if needed

            const newPosition = getRandomPosition(existingPositions);
            // うまくいかない
            socket?.emit('itemRemoved', {...item, x: newPosition.x, y: newPosition.y});
            console.log('アイテムが取得されたらマップからすぐに消える',JSON.stringify(item));

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
            console.log(response)

            const updatedItem = await response.json();
            console.log('Updated item position:', updatedItem);
            socket?.emit('itemPlaced', {...item, x: newPosition.x, y: newPosition.y});
            alert("ここでemit")
        } catch (error) {
            console.error("Failed to update item position:", error);
        }
    }, [getRandomPosition]);

    return {handleItemCollection};
};

export default useDestroyAndRandom;
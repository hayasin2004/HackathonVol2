import {useCallback} from "react";
import {Socket} from "socket.io-client";

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
            if (item.itemId === 11) { // 11が水のIDであると仮定
                console.log('Water item detected, not moving.');
                return;
            }
            const existingPositions = []; // Fetch existing positions if needed
            const newPosition = getRandomPosition(existingPositions);

            const response = await fetch('/api/item/updateItemPosition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: item?.id,
                    newPosition,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update item position');
            }

            const updatedItem = await response.json();
            console.log('Updated item position:', updatedItem);
            socket?.emit('itemPlaced', {...item, x: newPosition.x, y: newPosition.y});
        } catch (error) {
            console.error("Failed to update item position:", error);
        }
    }, [getRandomPosition]);

    return {handleItemCollection};
};

export default useDestroyAndRandom;
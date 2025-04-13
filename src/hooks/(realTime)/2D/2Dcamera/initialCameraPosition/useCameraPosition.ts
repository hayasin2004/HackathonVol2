import { useState, useEffect } from "react";
import {Map_height, Map_width, Tile_size} from "@/components/(konva)/grassmap/mapData";

const useCameraPosition = (
    playerX: number,
    playerY: number
) => {
    const [cameraPosition, setCameraPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const Tile_size = 64; // タイルのサイズ
    const MAP_PIXEL_WIDTH = Map_width * Tile_size;
    const MAP_PIXEL_HEIGHT = Map_height * Tile_size;

    useEffect(() => {
        const calculateInitialCameraPos = (playerX: number, playerY: number) => {
            const windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;
            const windowHeight = typeof window !== "undefined" ? window.innerHeight : 0;
            let targetX = playerX + Tile_size / 2 - windowWidth / 2;
            let targetY = playerY + Tile_size / 2 - windowHeight / 2;
            targetX = Math.max(0, Math.min(targetX, MAP_PIXEL_WIDTH - windowWidth));
            targetY = Math.max(0, Math.min(targetY, MAP_PIXEL_HEIGHT - windowHeight));
            targetX = windowWidth >= MAP_PIXEL_WIDTH ? 0 : targetX;
            targetY = windowHeight >= MAP_PIXEL_HEIGHT ? 0 : targetY;
            return { x: targetX, y: targetY };
        };

        setCameraPosition(calculateInitialCameraPos(playerX, playerY));
    }, [playerX, playerY, Tile_size, MAP_PIXEL_WIDTH, MAP_PIXEL_HEIGHT]);

    return cameraPosition;
};

export default useCameraPosition;
　
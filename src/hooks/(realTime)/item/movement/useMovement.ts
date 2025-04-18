// useMovement.ts
import { useCallback, useRef, useEffect } from "react";

interface UseMovementProps {
    mapWidthInPixels?: number;
    mapHeightInPixels?: number;
    setECollisionPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

const TILE_SIZE = 64;
const DEFAULT_MOVE_INTERVAL = 150;

export const useMovement = ({
                                mapWidthInPixels,
                                mapHeightInPixels,
                                setECollisionPosition
                            }: UseMovementProps) => {
    const keysPressedRef = useRef({
        ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    });
    const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const updatePosition = useCallback(() => {
        setECollisionPosition(prev => {
            let newX = prev.x;
            let newY = prev.y;
            const moveAmount = TILE_SIZE;

            if (keysPressedRef.current.ArrowUp) newY -= moveAmount;
            if (keysPressedRef.current.ArrowDown) newY += moveAmount;
            if (keysPressedRef.current.ArrowLeft) newX -= moveAmount;
            if (keysPressedRef.current.ArrowRight) newX += moveAmount;

            const minX = 0;
            const minY = 0;
            const maxX = mapWidthInPixels !== undefined ? mapWidthInPixels - TILE_SIZE : Infinity;
            const maxY = mapHeightInPixels !== undefined ? mapHeightInPixels - TILE_SIZE : Infinity;

            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));

            if (newX !== prev.x || newY !== prev.y) {
                return { x: newX, y: newY };
            }
            return prev;
        });
    }, [mapWidthInPixels, mapHeightInPixels, setECollisionPosition]);

    const startMoving = useCallback(() => {
        if (moveIntervalRef.current) return;
        updatePosition();
        moveIntervalRef.current = setInterval(updatePosition, DEFAULT_MOVE_INTERVAL);
    }, [updatePosition]);

    const stopMoving = useCallback(() => {
        if (moveIntervalRef.current) {
            clearInterval(moveIntervalRef.current);
            moveIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;
            if (key in keysPressedRef.current) {
                e.preventDefault();
                const directionKey = key as keyof typeof keysPressedRef.current;
                if (!keysPressedRef.current[directionKey]) {
                    keysPressedRef.current[directionKey] = true;
                    startMoving();
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key;
            if (key in keysPressedRef.current) {
                e.preventDefault();
                const directionKey = key as keyof typeof keysPressedRef.current;
                keysPressedRef.current[directionKey] = false;

                const anyKeyPressed = Object.values(keysPressedRef.current).some(val => val);
                if (!anyKeyPressed) stopMoving();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            stopMoving();
        };
    }, [startMoving, stopMoving]);

    return {};
};

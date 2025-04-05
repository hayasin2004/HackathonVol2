"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { defaultItem } from "@/types/defaultItem";
import { playerGetItem } from "@/app/api/(realtime)/item/getItem/route";

interface UseGetItemProps {
    userId?: number;
    initialPosition: { x: number; y: number };
    circleRadius?: number;
    rectPositions?: Array<defaultItem> | null;
    speed?: number;
    mapWidthInPixels?: number;
    mapHeightInPixels?: number;
}

const TILE_SIZE = 64;
const DEFAULT_MOVE_INTERVAL = 150; // Default movement speed in ms

const useRemakeItemGet = ({
                              userId,
                              initialPosition,
                              circleRadius = 0,
                              rectPositions,
                              speed,
                              mapWidthInPixels,
                              mapHeightInPixels,
                          }: UseGetItemProps) => {
    const [ECollisionPosition, setECollisionPosition] = useState(initialPosition);
    const [adjacentObstacles, setAdjacentObstacles] = useState<defaultItem[] | null>(null);
    const [ePressCount, setEPressCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ECollisionStatus, setECollisionStatus] = useState(false);

    const eKeyPressedRef = useRef(false);
    const keysPressedRef = useRef({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
    });
    const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastMoveTimeRef = useRef<number>(0);

    // Calculate movement interval based on speed
    const moveInterval = speed ? Math.max(50, 400 - speed) : DEFAULT_MOVE_INTERVAL;

    // Collision detection function
    const getCollidingObstacles = useCallback((playerX: number, playerY: number): defaultItem[] => {
        if (!rectPositions || rectPositions.length === 0) return [];

        const playerTileX = Math.floor(playerX / TILE_SIZE);
        const playerTileY = Math.floor(playerY / TILE_SIZE);

        const colliding = rectPositions.filter((rect) => {
            if (rect.x == null || rect.y == null || !rect.width || !rect.height) {
                return false;
            }
            const itemCenterX = rect.x + rect.width / 2;
            const itemCenterY = rect.y + rect.height / 2;
            const itemTileX = Math.floor(itemCenterX / TILE_SIZE);
            const itemTileY = Math.floor(itemCenterY / TILE_SIZE);

            const isAdjacent =
                Math.abs(itemTileX - playerTileX) <= 1 &&
                Math.abs(itemTileY - playerTileY) <= 1;

            return isAdjacent;
        });
        return colliding;
    }, [rectPositions]);

    // E key handler
    const handleEKeyPress = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const currentX = ECollisionPosition.x ?? 0;
            const currentY = ECollisionPosition.y ?? 0;
            const collidingObstacles = getCollidingObstacles(currentX, currentY);

            if (collidingObstacles.length > 0) {
                setAdjacentObstacles(collidingObstacles);
                const itemIdsToGet = collidingObstacles
                    .map((item) => item.id)
                    .filter((id): id is number => id !== undefined);

                if (itemIdsToGet.length > 0 && userId !== undefined) {
                    const result = await playerGetItem(userId, itemIdsToGet);
                    if (result?.status === "success" && result.savedItem) {
                        console.log("Item acquisition success:", result.savedItem);
                    }
                }
            } else {
                setAdjacentObstacles(null);
            }
        } catch (err) {
            console.error("Error occurred while getting item", err);
        } finally {
            setIsProcessing(false);
        }
    }, [ECollisionPosition, getCollidingObstacles, userId]);

    // Position update function - core logic for movement
    const updatePosition = useCallback(() => {
        const now = Date.now();

        // Throttle movement to respect moveInterval
        if (now - lastMoveTimeRef.current < moveInterval) {
            return;
        }

        lastMoveTimeRef.current = now;

        setECollisionPosition((prev) => {
            let newX = prev.x;
            let newY = prev.y;
            const moveAmount = TILE_SIZE;

            // Check which direction keys are pressed and update position
            if (keysPressedRef.current.ArrowUp) newY -= moveAmount;
            if (keysPressedRef.current.ArrowDown) newY += moveAmount;
            if (keysPressedRef.current.ArrowLeft) newX -= moveAmount;
            if (keysPressedRef.current.ArrowRight) newX += moveAmount;

            // Boundary check
            const minX = 0;
            const minY = 0;
            const maxX = mapWidthInPixels !== undefined ? mapWidthInPixels - TILE_SIZE : Infinity;
            const maxY = mapHeightInPixels !== undefined ? mapHeightInPixels - TILE_SIZE : Infinity;

            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));

            // Only update if position changed
            if (newX !== prev.x || newY !== prev.y) {
                return { x: newX, y: newY };
            }
            return prev;
        });
    }, [moveInterval, mapWidthInPixels, mapHeightInPixels]);

    // Set up movement animation using requestAnimationFrame instead of setInterval
    const animateMovement = useCallback(() => {
        updatePosition();

        // Check if any movement keys are still pressed
        const anyKeyPressed = Object.values(keysPressedRef.current).some(pressed => pressed);

        if (anyKeyPressed) {
            moveIntervalRef.current = requestAnimationFrame(animateMovement);
        } else {
            moveIntervalRef.current = null;
        }
    }, [updatePosition]);

    // Start movement animation
    const startMoving = useCallback(() => {
        if (moveIntervalRef.current !== null) {
            cancelAnimationFrame(moveIntervalRef.current);
        }

        moveIntervalRef.current = requestAnimationFrame(animateMovement);
    }, [animateMovement]);

    // Stop movement animation
    const stopMoving = useCallback(() => {
        if (moveIntervalRef.current !== null) {
            cancelAnimationFrame(moveIntervalRef.current);
            moveIntervalRef.current = null;
        }
    }, []);

    // Set up keyboard event listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;

            // Handle E key press
            if (key === "e" || key === "E") {
                if (!eKeyPressedRef.current) {
                    eKeyPressedRef.current = true;
                    setEPressCount((prevCount) => prevCount + 1);
                    handleEKeyPress();
                }
                return;
            }

            // Handle arrow keys
            if (key in keysPressedRef.current) {
                e.preventDefault();
                const directionKey = key as keyof typeof keysPressedRef.current;

                // Update key state and start movement if needed
                if (!keysPressedRef.current[directionKey]) {
                    keysPressedRef.current[directionKey] = true;
                    startMoving();
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key;

            // Handle E key release
            if (key === "e" || key === "E") {
                eKeyPressedRef.current = false;
                return;
            }

            // Handle arrow key release
            if (key in keysPressedRef.current) {
                e.preventDefault();
                const directionKey = key as keyof typeof keysPressedRef.current;
                keysPressedRef.current[directionKey] = false;

                // Check if any arrow keys are still pressed
                const anyArrowKeyPressed = Object.values(keysPressedRef.current).some(pressed => pressed);

                // If no arrow keys are pressed, stop movement
                if (!anyArrowKeyPressed) {
                    stopMoving();
                }
            }
        };

        // Add event listeners
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // Clean up event listeners
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            stopMoving();
        };
    }, [handleEKeyPress, startMoving, stopMoving]);

    // Update collision state when position changes
    useEffect(() => {
        if (ECollisionPosition.x != null && ECollisionPosition.y != null) {
            const collidingObstacles = getCollidingObstacles(ECollisionPosition.x, ECollisionPosition.y);
            const hasCollision = collidingObstacles.length > 0;

            // Update collision status
            setECollisionStatus(prevStatus => {
                if (prevStatus !== hasCollision) {
                    return hasCollision;
                }
                return prevStatus;
            });

            // Update adjacent obstacles
            setAdjacentObstacles(prevObstacles => {
                const newObstacles = hasCollision ? collidingObstacles : null;

                const noChange =
                    (prevObstacles === null && newObstacles === null) ||
                    (prevObstacles !== null && newObstacles !== null &&
                        prevObstacles.length === newObstacles.length &&
                        prevObstacles.every((item, index) => item.id === newObstacles[index]?.id));

                if (noChange) {
                    return prevObstacles;
                } else {
                    return hasCollision ? [...collidingObstacles] : null;
                }
            });
        } else {
            setECollisionStatus(prev => prev ? false : prev);
            setAdjacentObstacles(prev => prev !== null ? null : prev);
        }
    }, [ECollisionPosition, getCollidingObstacles]);

    return {
        ECollisionPosition,
        ECollisionStatus,
        adjacentObstacles,
        ePressCount,
    };
};

export default useRemakeItemGet;
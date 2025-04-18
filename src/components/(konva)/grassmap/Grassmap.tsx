"use client";

import React, { useState, useEffect,  } from "react";
import { Tile_size, Map_width, Map_height, Map_data } from "./mapData";
import { useSocketConnection } from "@/hooks/(realTime)/connection/useScoketConnection";
import useRemakeItemGet from "@/hooks/(realTime)/test/useRemakeItemGet";
import { useSupabaseRealtime } from "@/hooks/(realTime)/supabaseRealTime/useSupabaseRealTime";
import { defaultItem } from "@/types/defaultItem";
import { extractInteractableObjects } from "@/script/extractInteractableObjects";
import { MapTilesType } from "@/types/map";
import { get_character } from "@/script/get_character";
import useCharacterImage from "@/hooks/(realTime)/2D/2Dcamera/getCharacterImage/useCharacterImage";
import useCameraPosition from "@/hooks/(realTime)/2D/2Dcamera/initialCameraPosition/useCameraPosition";
import useGenerateMap from "@/hooks/(realTime)/2D/2DMap/firstMapGenerateTile/useGenerateMap";
import useMotionCharacter from "@/hooks/(realTime)/2D/2DCharacterMotion/useMotionCharacter";
import { CharacterImageData } from "@/types/character";
import { PlayerItem } from "@/types/playerItem";
import useGetItem from "@/hooks/(realTime)/item/getItem/useGetItem";
import MapVolOne from "@/components/mapVolOne/MapVolOne";
import useToastItem from "@/hooks/(realTime)/item/toastItem/useToastItem";
import PlayerInventory from "@/components/playerInventory/PlayerInventory";

interface GameProps {
    playerId: PlayerItem;
    itemData: defaultItem[];
    roomId: number;
}

const MapWithCharacter: React.FC<GameProps> = ({ playerId, roomId, itemData }) => {
    const { itemEvents, craftEvents } = useSupabaseRealtime(roomId, playerId.id);
    const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
    const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [tileImages, setTileImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [interactableMapObjects, setInteractableMapObjects] = useState<Array<MapTilesType>>([]);
    const [notifications, setNotifications] = useState<string[]>([]);

    const [objectItemImage, setObjectItemImage] = useState<
        { id: string; x: number; y: number; iconImage: HTMLImageElement }[] | null
    >([]);

    useEffect(() => {
        const itemIconFetch = async () => {
            try {
                const response = await fetch(`/api/item/getObjectItem/${roomId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setObjectItemImage(data.roomItems);
            } catch (error) {
                console.error("データ取得に失敗しました:", error);
            }
        };
        itemIconFetch();
    }, [roomId]);

    const waterTiles: { x: number; y: number }[] = [];

    Map_data.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === "water") {
                waterTiles.push({ x: x * Tile_size, y: y * Tile_size });
            }
        });
    });

    const {
        ECollisionPosition,
        eCollisionGotItem,
        eCollisionGotItemStatus,
        handleEKeyPress,
        clearGotItems
    } = useRemakeItemGet({
        userId: playerId.id,
        initialPosition: { x: playerId.x ?? 0, y: playerId.y ?? 0 },
        rectPositions: objectItemImage,
        waterTiles: waterTiles,
        mapWidthInPixels: Map_width * Tile_size,
        mapHeightInPixels: Map_height * Tile_size
    });

    const { socket, connected, players, items, error, movePlayer } = useSocketConnection(playerId.playerId, roomId);

    useEffect(() => {
        movePlayer(ECollisionPosition.x, ECollisionPosition.y);
    }, [ECollisionPosition]);

    const [characterImageData, setCharacterImageData] = useState<CharacterImageData | null>(null);

    const { playerCharacter, isLoadingCharacter } = useMotionCharacter(characterImageData);

    const cameraPositionHook = useCameraPosition(
        ECollisionPosition.x,
        ECollisionPosition.y
    );

    useEffect(() => {
        setCameraPosition(cameraPositionHook);
    }, [cameraPosition, ECollisionPosition]);

    const { tileImagesComplete, isLoading } = useGenerateMap();

    useEffect(() => {
        setTileImages(tileImagesComplete);
    }, [tileImagesComplete, isLoading]);

    useEffect(() => {
        const fetchCharacterImages = async () => {
            try {
                const response = await get_character(playerId.playerId);
                setCharacterImageData(response);
            } catch (error) {
                console.error("Error fetching character images:", error);
            }
        };
        const interactableMapObjects = extractInteractableObjects();
        if (interactableMapObjects) {
            setInteractableMapObjects(interactableMapObjects);
        }

        fetchCharacterImages();
    }, [playerId]);

    const LoadPlayerCharacterImage = useCharacterImage(itemData);

    useEffect(() => {
        setLoadedImages(LoadPlayerCharacterImage);
    }, [itemData]);

    const { setECollisionGotItem, triggerToast } = useToastItem(clearGotItems);

    useEffect(() => {
        if (Array.isArray(eCollisionGotItem) && eCollisionGotItem.length > 0) {
            triggerToast(eCollisionGotItem);
            setTimeout(() => {
                setECollisionGotItem([]);
            }, 0);
        }
    }, [eCollisionGotItem]);

    const { playerItemsHook } = useGetItem(itemEvents, playerId);
    useEffect(() => {
        setPlayerImage(playerItemsHook);
    }, [itemEvents, playerId]);

    if (!connected) {
        return <div className="loading">サーバーに接続中...</div>;
    }

    if (error) {
        return <div className="error">エラー: {error}</div>;
    }

    return (
        <div style={{ outline: "none" }}>
            <MapVolOne
                playerId={playerId}
                ECollisionPosition={ECollisionPosition}
                playerCharacter={playerCharacter}
                objectItemImage={objectItemImage}
            />
            <PlayerInventory
                playerId={playerId}
                players={players}
                eCollisionGotItem={eCollisionGotItem}
                craftEvents={craftEvents}
            />
            {players
                .filter(player => player.playerId !== playerId.playerId)
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
                    >
                        {player.playerId}
                    </div>
                ))}
        </div>
    );
}

export default MapWithCharacter;

import {useEffect, useState} from "react";
import {Tile_list} from "@/components/(konva)/snowmap/mapData";

const useGenerateMap = () => {
    const [tileImagesComplete, setTileImagesComplete] = useState<{ [key: string]: HTMLImageElement }>({});
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        const loadImages = async () => {
            const tiles = Object.values(Tile_list);
            const loadedImagesObj: { [key: string]: HTMLImageElement } = {};

            await Promise.all(
                tiles.map((tile) => {
                    return new Promise<void>((resolve, reject) => {
                        const img = new window.Image();
                        img.src = `/tiles/${tile}.png`;
                        img.onload = () => {
                            loadedImagesObj[tile] = img;
                            resolve();
                        };
                        img.onerror = (err) => {
                            console.error(`Failed to load image: ${tile}`, err);
                            reject(err);
                        };
                    });
                })
            );

            setTileImagesComplete(loadedImagesObj);
            setIsLoading(false);
        };

        loadImages();
    }, []);

    return {tileImagesComplete, isLoading};
};

export default useGenerateMap;
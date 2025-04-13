import React, {useEffect, useState} from 'react';
import {Tile_list} from "@/components/(konva)/grassmap/mapData";

const useGenerateMap = () => {
    const [tileImages, setTileImages] = useState<{ [key: string]: HTMLImageElement }>({});
    useEffect(() => {

        const tiles = Object.values(Tile_list);
        const loadedImagesObj: { [key: string]: HTMLImageElement } = {};
        tiles.forEach((tile) => {
            const img = new window.Image();
            img.src = `/tiles/${tile}.png`;
            img.onload = () => {
                loadedImagesObj[tile] = img;
                if (Object.keys(loadedImagesObj).length === tiles.length) {
                    setTileImages(loadedImagesObj);
                }
            };
        });
    }, [])
    return tileImages
};

export default useGenerateMap;
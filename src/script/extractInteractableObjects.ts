import {Map_data, Tile_size} from "@/components/(konva)/grassmap/mapData";
import {MapTilesType} from "@/types/map";
const ObjectToItemMapping = {
    tree: "wood",
    stone: "stone",
    iron: "iron",
    coal: "coal",
    flower: "flower",
    mushroom: "mushroom",
    insect: "insect",
    water: "water",
};


export  const extractInteractableObjects = () => {
    console.log("これ無限ループ説")
    const mapData = Map_data
    const interactableObjects: Array<MapTilesType> = [];
    mapData.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            const objectType = tile;
            if (objectType in ObjectToItemMapping) {
                const isLargeObject = ["tree", "stone", "iron", "coal"].includes(objectType);
                if (isLargeObject) {
                    const isRightNeighborSame = mapData[rowIndex]?.[colIndex - 1] === objectType;
                    const isBottomNeighborSame = mapData[rowIndex - 1]?.[colIndex] === objectType;
                    const isBottomRightSame = mapData[rowIndex - 1]?.[colIndex - 1] === objectType;
                    if (isRightNeighborSame || isBottomNeighborSame || isBottomRightSame) {
                        return;
                    }
                    interactableObjects.push({
                        id: `map-${objectType}-${rowIndex}-${colIndex}`,
                        type: objectType,
                        x: colIndex * Tile_size,
                        y: rowIndex * Tile_size,
                        width: Tile_size * 2,
                        height: Tile_size * 2,
                        isMapObject: true,
                        relatedItemId: ObjectToItemMapping[objectType as keyof typeof ObjectToItemMapping],
                    });
                } else {
                    interactableObjects.push({
                        id: `map-${objectType}-${rowIndex}-${colIndex}`,
                        type: objectType,
                        x: colIndex * Tile_size,
                        y: rowIndex * Tile_size,
                        width: Tile_size,
                        height: Tile_size,
                        isMapObject: true,
                        relatedItemId: ObjectToItemMapping[objectType as keyof typeof ObjectToItemMapping],
                    });
                }
            }
        });
    });
    return interactableObjects;
};

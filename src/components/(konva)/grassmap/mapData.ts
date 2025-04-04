// サイズ定義
import {defaultItem} from "@/types/defaultItem";

export const Tile_size = 64; // タイルのサイズ
export const Map_width = 50; // 横幅
export const Map_height = 50; // 高さ

// タイルの種類 辞書型に定義
export const Tile_list = {
    Grass: "grass",
    Path: "path",
    Building: "building",
    Water: "water",
    Leaves: "leaves",
    Tree: "tree",
    Stone: "stone",
    Iron: "iron",
    Coal: "coal",
    Flower: "flower",
    Mushroom: "mushroom",
    Insect: "insect",
};

// データ型の定義


export const generateItemPositions = (
    items: defaultItem[],
    map: string[][],
    minDistance: number = 1
) => {
    const itemPositions: { tileX: number; tileY: number }[] = [];

    const isTooClose = (x: number, y: number) => {
        return itemPositions.some(pos => {
            const dx = Math.abs(pos.tileX - x);
            const dy = Math.abs(pos.tileY - y);
            return Math.sqrt(dx * dx + dy * dy) <= minDistance;
        });
    };

    items.forEach((item) => {
        const tileX = Math.floor(item.x! / Tile_size);
        const tileY = Math.floor(item.y! / Tile_size);

        const isInBounds =
            tileX >= 0 && tileX < Map_width &&
            tileY >= 0 && tileY < Map_height;

        const isTileEmpty = map[tileY]?.[tileX] === "grass"; // ←ここポイント！

        if (isInBounds && isTileEmpty && !isTooClose(tileX, tileY)) {
            itemPositions.push({ tileX, tileY });
        }
    });

    return itemPositions;
};
// マップ生成関数
//ランダムマップ再生 Array.fromで一つ一つを"grass"に設定
export const generateMap = () => {
    const map2d: string[][] = [];

    // 2D配列を grass で初期化
    for (let y = 0; y < Map_height; y++) {
        map2d[y] = new Array(Map_width).fill("grass");
    }

    // 使用済み座標を追跡するセット
    const occupiedPositions = new Set<string>();

    const isPositionOccupied = (x: number, y: number) => {
        return occupiedPositions.has(`${x}-${y}`);
    };

    const markPositionOccupied = (x: number, y: number) => {
        occupiedPositions.add(`${x}-${y}`);
    };

    // 建物の設置
    for (let i = 0; i < 10; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * Map_width);
            y = Math.floor(Math.random() * Map_height);
        } while (isPositionOccupied(x, y));

        map2d[y][x] = "building";
        markPositionOccupied(x, y);
    }

    // アイテムランダム配置系
    const placeRandom = (label: string, count: number) => {
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * Map_width);
                y = Math.floor(Math.random() * Map_height);
            } while (isPositionOccupied(x, y));

            map2d[y][x] = label;
            markPositionOccupied(x, y);
        }
    };

    placeRandom("leaves", 30);
    placeRandom("flower", 30);
    placeRandom("mushroom", 20);
    placeRandom("insect", 15);

    // 2x2の資源設置（tree, stone, iron, coal）
    const placeSquare = (label: string, count: number) => {
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (Map_width - 1));
                y = Math.floor(Math.random() * (Map_height - 1));
            } while (
                isPositionOccupied(x, y) ||
                isPositionOccupied(x + 1, y) ||
                isPositionOccupied(x, y + 1) ||
                isPositionOccupied(x + 1, y + 1)
                );

            map2d[y][x] = label;
            map2d[y][x + 1] = label;
            map2d[y + 1][x] = label;
            map2d[y + 1][x + 1] = label;

            markPositionOccupied(x, y);
            markPositionOccupied(x + 1, y);
            markPositionOccupied(x, y + 1);
            markPositionOccupied(x + 1, y + 1);
        }
    };

    placeSquare("tree", 10);
    placeSquare("stone", 10);
    placeSquare("iron", 5);
    placeSquare("coal", 10);

    // 水を横一列に設置（y=20）
    for (let i = 5; i < 20; i++) {
        map2d[20][i] = "water";
        markPositionOccupied(i, 20);
    }

    // 横一直線の道（マップ中央）
    const middle = Math.floor(Map_height / 2);
    for (let i = 0; i < Map_width; i++) {
        map2d[middle][i] = "path";
        markPositionOccupied(i, middle);
    }

    return map2d;
};;

export const Map_data = generateMap();

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

  const placeTile = (tile: string, count: number, size = 1) => {
    let placed = 0;
    while (placed < count) {
      const x = Math.floor(Math.random() * (Map_width - (size - 1)));
      const y = Math.floor(Math.random() * (Map_height - (size - 1)));

      if (size === 1) {
        if (map2d[y]?.[x] === "grass") {
          map2d[y][x] = tile;
          placed++;
        }
      } else if (size === 2) {
        if (
            map2d[y]?.[x] === "grass" &&
            map2d[y]?.[x + 1] === "grass" &&
            map2d[y + 1]?.[x] === "grass" &&
            map2d[y + 1]?.[x + 1] === "grass"
        ) {
          map2d[y][x] = tile;
          map2d[y][x + 1] = tile;
          map2d[y + 1][x] = tile;
          map2d[y + 1][x + 1] = tile;
          placed++;
        }
      }
    }
  };

  // 各タイルを配置
  placeTile("building", 10);
  placeTile("leaves", 30);
  placeTile("flower", 30);
  placeTile("mushroom", 20);
  placeTile("insect", 15);

  placeTile("tree", 10, 2);
  placeTile("stone", 10, 2);
  placeTile("iron", 5, 2);
  placeTile("coal", 10, 2);

  // 水を横一列に設置（y=20）
  for (let i = 5; i < 20; i++) {
    map2d[20][i] = "water";
  }

  // 横一直線の道（マップ中央）
  const middle = Math.floor(Map_height / 2);
  for (let i = 0; i < Map_width; i++) {
    map2d[middle][i] = "path";
  }

  return map2d;
};
export const Map_data = generateMap();

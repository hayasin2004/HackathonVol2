// サイズ定義
import { defaultItem } from "@/types/defaultItem";

export const Tile_size = 64; // タイルのサイズ
export const Map_width = 64; // 横幅
export const Map_height = 64; // 高さ

// タイルの種類 辞書型に定義
export const Tile_list = {
  Desert: "desert",
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
  Cobblestone: "cobblestone",
  ExitPath: "exitpath",
};

// データ型の定義

export const generateItemPositions = (
  items: defaultItem[],
  map: string[][],
  minDistance: number = 1
) => {
  const itemPositions: { tileX: number; tileY: number }[] = [];

  const isTooClose = (x: number, y: number) => {
    return itemPositions.some((pos) => {
      const dx = Math.abs(pos.tileX - x);
      const dy = Math.abs(pos.tileY - y);
      return Math.sqrt(dx * dx + dy * dy) <= minDistance;
    });
  };

  items.forEach((item) => {
    const tileX = Math.floor(item.x! / Tile_size);
    const tileY = Math.floor(item.y! / Tile_size);

    const isInBounds =
      tileX >= 0 && tileX < Map_width && tileY >= 0 && tileY < Map_height;

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
  for (let y = 0; y <= 11; y++) {
    map2d[y][19] = "path"; // x20 y0~11 A-1 <=
  }
  for (let y = 0; y <= 11; y++) {
    map2d[y][20] = "path"; // x20 y0~11 A <=
  }
  for (let y = 0; y <= 11; y++) {
    map2d[y][21] = "path"; // x20 y0~11 A+1 <=
  }

  for (let x = 0; x < 64; x++) {
    map2d[9][x] = "path"; // x0~64 y11 B-1 <
  }
  for (let x = 0; x < 64; x++) {
    map2d[10][x] = "path"; // x0~64 y11 B <
  }
  for (let x = 0; x < 64; x++) {
    map2d[11][x] = "path"; // x0~64 y11 B+1 <
  }

  for (let y = 11; y < 64; y++) {
    map2d[y][7] = "path"; // x8 y11~64 C-1 <
  }
  for (let y = 11; y < 64; y++) {
    map2d[y][8] = "path"; // x8 y11~64 C <
  }
  for (let y = 11; y < 64; y++) {
    map2d[y][9] = "path"; // x8 y11~64 C+1 <
  }

  for (let y = 11; y <= 56; y++) {
    map2d[y][53] = "path"; // x54 y11~56 D-1 <=
  }
  for (let y = 11; y <= 56; y++) {
    map2d[y][54] = "path"; // x54 y11~56 D <=
  }
  for (let y = 11; y <= 56; y++) {
    map2d[y][55] = "path"; // x54 y11~56 D+1 <=
  }

  for (let x = 38; x <= 54; x++) {
    map2d[34][x] = "path"; // x38~54 y35 E-1 <=
  }
  for (let x = 38; x <= 54; x++) {
    map2d[35][x] = "path"; // x38~54 y35 E <=
  }
  for (let x = 38; x <= 54; x++) {
    map2d[36][x] = "path"; // x38~54 y35 E+1 <=
  }

  for (let y = 35; y <= 47; y++) {
    map2d[y][37] = "path"; // x38 y35~47 F-1 <=
  }
  for (let y = 35; y <= 47; y++) {
    map2d[y][38] = "path"; // x38 y35~47 F <=
  }
  for (let y = 35; y <= 47; y++) {
    map2d[y][39] = "path"; // x38 y35~47 F+1 <=
  }

  for (let x = 8; x < 64; x++) {
    map2d[46][x] = "path"; // x8~64 y47 G-1 <
  }
  for (let x = 8; x < 64; x++) {
    map2d[47][x] = "path"; // x8~64 y47 G <
  }
  for (let x = 8; x < 64; x++) {
    map2d[48][x] = "path"; // x8~64 y47 G+1 <
  }

  for (let y = 47; y <= 56; y++) {
    map2d[y][22] = "path"; // x23 y47~56 H-1 <=
  }
  for (let y = 47; y <= 56; y++) {
    map2d[y][23] = "path"; // x23 y47~56 H <=
  }
  for (let y = 47; y <= 56; y++) {
    map2d[y][24] = "path"; // x23 y47~56 H+1 <=
  }

  for (let x = 23; x <= 54; x++) {
    map2d[55][x] = "path"; // x23~54 y56 I-1 <=
  }
  for (let x = 23; x <= 54; x++) {
    map2d[56][x] = "path"; // x23~54 y56 I <=
  }
  for (let x = 23; x <= 54; x++) {
    map2d[57][x] = "path"; // x23~54 y56 I+1 <=
  }

  for (let y = 58; y <= 63; y++) {
    map2d[y][37] = "path";
  }
  for (let y = 58; y <= 63; y++) {
    map2d[y][38] = "path";
  }
  for (let y = 58; y <= 63; y++) {
    map2d[y][39] = "path";
  }

  for (let y = 0; y <= 5; y++) {
    map2d[y][23] = "path"; // x20 y0~11 A-1 <=
  }
  for (let y = 0; y <= 5; y++) {
    map2d[y][24] = "path"; // x20 y0~11 A-1 <=
  }
  for (let y = 0; y <= 5; y++) {
    map2d[y][25] = "path"; // x20 y0~11 A-1 <=
  }
  for (let y = 3; y <= 5; y++) {
    map2d[y][22] = "path"; // x20 y0~11 A-1 <=
  }

  for (let x = 19; x <= 21; x++) {
    map2d[0][x] = "exitpath"; // x23~54 y56 I+1 <=
  }

  const placeTile = (tile: string, count: number, size = 1) => {
    let placed = 0;
    while (placed < count) {
      const x = Math.floor(Math.random() * (Map_width - (size - 1)));
      const y = Math.floor(Math.random() * (Map_height - (size - 1)));

      if (size === 1) {
        // 1タイルの時
        if (map2d[y][x] === "grass") {
          map2d[y][x] = tile;
          placed++;
        }
      } else if (size === 2) {
        if (
          map2d[y][x] === "grass" &&
          map2d[y][x + 1] === "grass" &&
          map2d[y + 1][x] === "grass" &&
          map2d[y + 1][x + 1] === "grass"
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
  //y=20の部分に水を作る
  for (let x = 20; x < 26; x++) {
    map2d[18][x] = "water";
  }
  for (let x = 17; x < 27; x++) {
    map2d[19][x] = "water";
  }
  for (let x = 17; x < 30; x++) {
    map2d[20][x] = "water";
  }
  for (let x = 16; x < 31; x++) {
    map2d[21][x] = "water";
  }
  for (let x = 15; x < 31; x++) {
    map2d[22][x] = "water";
  }
  for (let x = 14; x < 32; x++) {
    map2d[23][x] = "water";
  }
  for (let x = 15; x < 32; x++) {
    map2d[24][x] = "water";
  }
  for (let x = 15; x < 33; x++) {
    map2d[25][x] = "water";
  }
  for (let x = 17; x < 23; x++) {
    map2d[26][x] = "water";
  }
  for (let x = 18; x < 22; x++) {
    map2d[27][x] = "water";
  }
  for (let x = 19; x < 21; x++) {
    map2d[28][x] = "water";
  }
  for (let x = 27; x < 33; x++) {
    map2d[26][x] = "water";
  }
  for (let x = 28; x < 32; x++) {
    map2d[27][x] = "water";
  }
  for (let x = 29; x < 31; x++) {
    map2d[28][x] = "water";
  }

  for (let x = 19; x < 27; x++) {
    map2d[17][x] = "cobblestone";
  }
  for (let x = 17; x < 20; x++) {
    map2d[18][x] = "cobblestone";
  }
  for (let y = 18; y < 21; y++) {
    map2d[y][16] = "cobblestone";
  }
  for (let y = 20; y < 22; y++) {
    map2d[y][15] = "cobblestone";
  }
  for (let y = 21; y < 23; y++) {
    map2d[y][14] = "cobblestone";
  }
  for (let y = 22; y < 25; y++) {
    map2d[y][13] = "cobblestone";
  }
  for (let y = 24; y < 27; y++) {
    map2d[y][14] = "cobblestone";
  }
  for (let y = 26; y < 28; y++) {
    map2d[y][15] = "cobblestone";
  }
  for (let y = 26; y < 28; y++) {
    map2d[y][16] = "cobblestone";
  }
  for (let y = 27; y < 29; y++) {
    map2d[y][17] = "cobblestone";
  }
  for (let y = 28; y < 30; y++) {
    map2d[y][18] = "cobblestone";
  }
  for (let x = 19; x < 22; x++) {
    map2d[29][x] = "cobblestone";
  }
  for (let x = 21; x < 23; x++) {
    map2d[28][x] = "cobblestone";
  }
  for (let x = 22; x < 24; x++) {
    map2d[27][x] = "cobblestone";
  }
  for (let x = 23; x < 27; x++) {
    map2d[26][x] = "cobblestone";
  }
  for (let x = 26; x < 28; x++) {
    map2d[27][x] = "cobblestone";
  }
  for (let x = 27; x < 29; x++) {
    map2d[28][x] = "cobblestone";
  }
  for (let x = 28; x < 32; x++) {
    map2d[29][x] = "cobblestone";
  }
  for (let x = 31; x < 33; x++) {
    map2d[28][x] = "cobblestone";
  }
  for (let x = 32; x < 34; x++) {
    map2d[27][x] = "cobblestone";
  }
  for (let x = 33; x < 35; x++) {
    map2d[26][x] = "cobblestone";
  }
  for (let x = 33; x < 35; x++) {
    map2d[25][x] = "cobblestone";
  }
  for (let x = 32; x < 34; x++) {
    map2d[24][x] = "cobblestone";
  }
  for (let y = 22; y < 24; y++) {
    map2d[y][32] = "cobblestone";
  }
  for (let y = 20; y < 23; y++) {
    map2d[y][31] = "cobblestone";
  }
  for (let y = 19; y < 21; y++) {
    map2d[y][30] = "cobblestone";
  }
  for (let x = 27; x < 30; x++) {
    map2d[19][x] = "cobblestone";
  }
  for (let x = 26; x < 28; x++) {
    map2d[18][x] = "cobblestone";
  }
  //ループ処理（iがイコールになるまで繰り返す）[i]は横幅を表す
  // for (let i = 0; i < Map_width; i++) {
  //     const middle = Math.floor(Map_height / 2);
  //     map2d[middle][i] = "path";
  // }

  // **各タイルを配置（1×1）**
  // placeTile("building", 10);
  // placeTile("leaves", 30);
  // placeTile("mushroom", 10);
  // placeTile("insect", 15);

  // **各タイルを配置（2×2）**
  // placeTile("tree", 20, 2);
  // placeTile("stone", 15, 2);
  // placeTile("iron", 5, 2);
  // placeTile("coal", 10, 2);
  // placeTile("flower",60);

  return map2d;
};

export const Map_data = generateMap();

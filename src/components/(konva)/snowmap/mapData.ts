// サイズ定義
import { defaultItem } from "@/types/defaultItem";

export const Tile_size = 64; // タイルのサイズ
export const Map_width = 64; // 横幅
export const Map_height = 64; // 高さ

// タイルの種類 辞書型に定義
export const Tile_list = {
  IceWater: "icewater",
  SnowPath: "snowpath",
  Snow: "snow",
  // Desert: "desert",
  // Grass: "grass",
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

    const isTileEmpty = map[tileY]?.[tileX] === "snow"; // ←ここポイント！

    if (isInBounds && isTileEmpty && !isTooClose(tileX, tileY)) {
      itemPositions.push({ tileX, tileY });
    }
  });

  return itemPositions;
};
// マップ生成関数
//ランダムマップ再生 Array.fromで一つ一つを"snow"に設定
export const generateMap = () => {
  const map2d: string[][] = [];

  // 2D配列を snow で初期化
  for (let y = 0; y < Map_height; y++) {
    map2d[y] = new Array(Map_width).fill("snow");
  }

  for (let y = 0; y <= 39; y++) {
    map2d[y][23] = "snowpath"; // x20 y0~11 A-1 <=
  }
  for (let y = 0; y <= 39; y++) {
    map2d[y][24] = "snowpath"; // x20 y0~11 A <=
  }
  for (let y = 0; y <= 39; y++) {
    map2d[y][25] = "snowpath"; // x20 y0~11 A+1 <=
  }

  for (let y = 23; y <= 63; y++) {
    map2d[y][37] = "snowpath"; // x20 y0~11 A-1 <=
  }
  for (let y = 23; y <= 63; y++) {
    map2d[y][38] = "snowpath"; // x20 y0~11 A <=
  }
  for (let y = 23; y <= 63; y++) {
    map2d[y][39] = "snowpath"; // x20 y0~11 A+1 <=
  }

  for (let y = 37; y <= 51; y++) {
    map2d[y][10] = "snowpath"; // x20 y0~11 A-1 <=
  }
  for (let y = 37; y <= 52; y++) {
    map2d[y][11] = "snowpath"; // x20 y0~11 A <=
  }
  for (let y = 37; y <= 52; y++) {
    map2d[y][12] = "snowpath"; // x20 y0~11 A+1 <=
  }

  for (let y = 10; y <= 25; y++) {
    map2d[y][50] = "snowpath"; // x20 y0~11 A-1 <=
  }
  for (let y = 10; y <= 25; y++) {
    map2d[y][51] = "snowpath"; // x20 y0~11 A <=
  }
  for (let y = 11; y <= 25; y++) {
    map2d[y][52] = "snowpath"; // x20 y0~11 A+1 <=
  }

  for (let x = 0; x <= 39; x++) {
    map2d[37][x] = "snowpath"; // x20 y0~11 A-1 <=
  }
  for (let x = 0; x <= 39; x++) {
    map2d[38][x] = "snowpath"; // x20 y0~11 A <=
  }
  for (let x = 0; x <= 39; x++) {
    map2d[39][x] = "snowpath"; // x20 y0~11 A+1 <=
  }

  for (let x = 23; x <= 63; x++) {
    map2d[23][x] = "snowpath"; // x20 y0~11 A-1 <=
  }
  for (let x = 23; x <= 63; x++) {
    map2d[24][x] = "snowpath"; // x20 y0~11 A <=
  }
  for (let x = 23; x <= 63; x++) {
    map2d[25][x] = "snowpath"; // x20 y0~11 A+1 <=
  }

  for (let x = 10; x <= 39; x++) {
    map2d[50][x] = "snowpath"; // x20 y0~11 A-1 <=
  }
  for (let x = 10; x <= 39; x++) {
    map2d[51][x] = "snowpath"; // x20 y0~11 A <=
  }
  for (let x = 11; x <= 39; x++) {
    map2d[52][x] = "snowpath"; // x20 y0~11 A+1 <=
  }

  for (let x = 23; x <= 51; x++) {
    map2d[10][x] = "snowpath"; // x20 y0~11 A-1 <=
  }
  for (let x = 23; x <= 52; x++) {
    map2d[11][x] = "snowpath"; // x20 y0~11 A <=
  }
  for (let x = 23; x <= 52; x++) {
    map2d[12][x] = "snowpath"; // x20 y0~11 A+1 <=
  }

  map2d[49][13] = "snowpath"; // x20 y0~11 A+1 <=

  map2d[13][49] = "snowpath"; // x20 y0~11 A+1 <=

  ////////////////////氷水

  for (let y = 42; y <= 60; y++) {
    map2d[y][43] = "icewater"; // x20 y0~11 A+1 <=
  }
  for (let y = 36; y <= 63; y++) {
    map2d[y][44] = "icewater"; // x20 y0~11 A+1 <=
  }
  for (let y = 32; y <= 63; y++) {
    map2d[y][45] = "icewater"; // x20 y0~11 A+1 <=
  }

  for (let y = 31; y <= 63; y++) {
    for (let x = 46; x <= 49; x++) {
      map2d[y][x] = "icewater"; // x20 y0~11 A+1 <=
    }
  }
  for (let y = 30; y <= 63; y++) {
    for (let x = 50; x <= 55; x++) {
      map2d[y][x] = "icewater"; // x20 y0~11 A+1 <=
    }
  }
  for (let y = 29; y <= 63; y++) {
    for (let x = 56; x <= 63; x++) {
      map2d[y][x] = "icewater"; // x20 y0~11 A+1 <=
    }
  }

  for (let y = 3; y <= 20; y++) {
    map2d[y][19] = "icewater"; // x20 y0~11 A+1 <=
  }
  for (let y = 0; y <= 26; y++) {
    map2d[y][18] = "icewater"; // x20 y0~11 A+1 <=
  }
  for (let y = 0; y <= 30; y++) {
    map2d[y][17] = "icewater"; // x20 y0~11 A+1 <=
  }

  for (let y = 0; y <= 33; y++) {
    for (let x = 0; x <= 6; x++) {
      map2d[y][x] = "icewater"; // x20 y0~11 A+1 <=
    }
  }
  for (let y = 0; y <= 32; y++) {
    for (let x = 7; x <= 12; x++) {
      map2d[y][x] = "icewater"; // x20 y0~11 A+1 <=
    }
  }
  for (let y = 0; y <= 31; y++) {
    for (let x = 13; x <= 16; x++) {
      map2d[y][x] = "icewater"; // x20 y0~11 A+1 <=
    }
  }

  const placeTile = (tile: string, count: number, size = 1) => {
    let placed = 0;
    while (placed < count) {
      const x = Math.floor(Math.random() * (Map_width - (size - 1)));
      const y = Math.floor(Math.random() * (Map_height - (size - 1)));

      if (size === 1) {
        // 1タイルの時
        if (map2d[y][x] === "snow") {
          map2d[y][x] = tile;
          placed++;
        }
      } else if (size === 2) {
        if (
          map2d[y][x] === "snow" &&
          map2d[y][x + 1] === "snow" &&
          map2d[y + 1][x] === "snow" &&
          map2d[y + 1][x + 1] === "snow"
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

  //ループ処理（iがイコールになるまで繰り返す）[i]は横幅を表す
  // for (let i = 0; i < Map_width; i++) {
  //     const middle = Math.floor(Map_height / 2);
  //     map2d[middle][i] = "snowpath";
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

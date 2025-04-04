//サイズ定義
export const Tile_size = 64; //タイルのサイズ
export const Map_width = 50; //横幅
export const Map_height = 50; //高さ

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

//ランダムマップ再生 Array.fromで一つ一つを"grass"に設定
export const generateMap = () => {
  // const map2d = Array.from({ length: Map_height }, () =>
  //   Array.from({ length: Map_width }, () => "grass")
  // );

  const map2d: string[][] = []; //２次元配列を初期化

  for (let y = 0; y < Map_height; y++) {
    map2d[y] = new Array(Map_width).fill("grass");
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

  // **各タイルを配置（1×1）**
  placeTile("building", 10);
  placeTile("leaves", 30);
  placeTile("flower", 30);
  placeTile("mushroom", 20);
  placeTile("insect", 15);

  // **各タイルを配置（2×2）**
  placeTile("tree", 10, 2);
  placeTile("stone", 10, 2);
  placeTile("iron", 5, 2);
  placeTile("coal", 10, 2);
  //建物の設置
  // for (let i = 0; i < 10; i++) {
  //   const x = Math.floor(Math.random() * Map_width);
  //   const y = Math.floor(Math.random() * Map_height);
  //   map2d[y][x] = "building";
  // }

  // for (let i = 0; i < 30; i++) {
  //   const x = Math.floor(Math.random() * Map_width);
  //   const y = Math.floor(Math.random() * Map_height);
  //   map2d[y][x] = "leaves";
  // }

  // for (let i = 0; i < 30; i++) {
  //   const x = Math.floor(Math.random() * Map_width);
  //   const y = Math.floor(Math.random() * Map_height);
  //   map2d[y][x] = "flower";
  // }

  // for (let i = 0; i < 20; i++) {
  //   const x = Math.floor(Math.random() * Map_width);
  //   const y = Math.floor(Math.random() * Map_height);
  //   map2d[y][x] = "mushroom";
  // }

  // for (let i = 0; i < 15; i++) {
  //   const x = Math.floor(Math.random() * Map_width);
  //   const y = Math.floor(Math.random() * Map_height);
  //   map2d[y][x] = "insect";
  // }

  // for (let i = 0; i < 10; i++) {
  //   const x = Math.floor(Math.random() * Map_width - 1);
  //   const y = Math.floor(Math.random() * Map_height - 1);

  //   if (x < Map_width - 1 && y < Map_height - 1) {
  //     map2d[y][x] = "tree";
  //     map2d[y][x + 1] = "tree";
  //     map2d[y + 1][x] = "tree";
  //     map2d[y + 1][x + 1] = "tree";
  //   }
  // }

  // for (let i = 0; i < 10; i++) {
  //   const x = Math.floor(Math.random() * Map_width - 1);
  //   const y = Math.floor(Math.random() * Map_height - 1);

  //   if (x < Map_width - 1 && y < Map_height - 1) {
  //     map2d[y][x] = "stone";
  //     map2d[y][x + 1] = "stone";
  //     map2d[y + 1][x] = "stone";
  //     map2d[y + 1][x + 1] = "stone";
  //   }
  // }

  // for (let i = 0; i < 5; i++) {
  //   const x = Math.floor(Math.random() * Map_width - 1);
  //   const y = Math.floor(Math.random() * Map_height - 1);

  //   if (x < Map_width - 1 && y < Map_height - 1) {
  //     map2d[y][x] = "iron";
  //     map2d[y][x + 1] = "iron";
  //     map2d[y + 1][x] = "iron";
  //     map2d[y + 1][x + 1] = "iron";
  //   }
  // }

  // for (let i = 0; i < 10; i++) {
  //   const x = Math.floor(Math.random() * Map_width - 1);
  //   const y = Math.floor(Math.random() * Map_height - 1);

  //   if (x < Map_width - 1 && y < Map_height - 1) {
  //     map2d[y][x] = "coal";
  //     map2d[y][x + 1] = "coal";
  //     map2d[y + 1][x] = "coal";
  //     map2d[y + 1][x + 1] = "coal";
  //   }
  // }

  //y=20の部分に水を作る
  for (let i = 5; i < 20; i++) {
    map2d[20][i] = "water";
  }

  //ループ処理（iがイコールになるまで繰り返す）[i]は横幅を表す
  for (let i = 0; i < Map_width; i++) {
    const middle = Math.floor(Map_height / 2);
    map2d[middle][i] = "path";
  }

  return map2d;
};

export const Map_data = generateMap();

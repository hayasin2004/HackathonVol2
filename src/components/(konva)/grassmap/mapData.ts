//サイズ定義
export const Tile_size = 48; //タイルのサイズ
export const Map_width = 50; //横幅
export const Map_height = 50; //高さ

// タイルの種類 辞書型に定義
export const Tile_list = {
  Grass: "grass",
  Path: "path",
  Building: "building",
  Water: "water",
};

//ランダムマップ再生 Array.fromで一つ一つを"grass"に設定
export const generateMap = () => {
  const map2d = Array.from({ length: Map_height }, () =>
    Array.from({ length: Map_width }, () => "grass")
  );

  //ループ処理（iがイコールになるまで繰り返す）[i]は横幅を表す
  for (let i = 0; i < Map_width; i++) {
    const middle = Math.floor(Map_height / 2);
    map2d[middle][i] = "path";
  }
  //建物の設置
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(Math.random() * Map_width);
    const y = Math.floor(Math.random() * Map_height);
    map2d[y][x] = "building";
  }
  //y=20の部分に水を作る
  for (let i = 5; i < 20; i++) {
    map2d[20][i] = "water";
  }

  return map2d;
};

export const Map_data = generateMap();

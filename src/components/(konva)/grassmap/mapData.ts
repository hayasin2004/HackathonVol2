// サイズ定義
import {defaultItem} from "@/types/defaultItem";

export const Tile_size = 64; // タイルのサイズ
export const Map_width = 50; // 横幅
export const Map_height = 50; // 高さ

// タイルの種類 辞書型に定義
// export const Tile_list = {
//     Grass: "grass",
//     Path: "path",
//     Building: "building",
//     Water: "water",
//     Leaves: "leaves",
//     Tree: "tree",
//     Stone: "stone",
//     Iron: "iron",
//     Coal: "coal",
//     Flower: "flower",
//     Mushroom: "mushroom",
//     Insect: "insect",
// };

// データ型の定義


export const generateItemPositions = (items: defaultItem[]) => {
    const itemPositions: { tileX: number; tileY: number; items: defaultItem }[] = [];
    console.log(items)
    // アイテムをタイル座標に変換してリスト化
    items.forEach((item) => {
        const tileX = Math.floor(item.x! / Tile_size); // ピクセル座標をタイル座標に変換
        const tileY = Math.floor(item.y! / Tile_size);

        // 範囲内の座標のみを追加
        if (tileX >= 0 && tileX < Map_width && tileY >= 0 && tileY < Map_height) {
            itemPositions.push({
                tileX,
                tileY,
                items: item,

            });
        }
    });

    return itemPositions; // 座標リストを返す
};


// マップ生成関数
// export const generateMap = (items: Item[]): string[][] => {
//   const map2d: string[][] = []; // 2次元配列を初期化
//
//   // すべてのタイルを"grass"に初期化
//   for (let y = 0; y < Map_height; y++) {
//     map2d[y] = new Array(Map_width).fill(Tile_list.Grass);
//   }
//
//   // ランダム要素の配置
//   for (let i = 0; i < 10; i++) {
//     const x = Math.floor(Math.random() * Map_width);
//     const y = Math.floor(Math.random() * Map_height);
//     map2d[y][x] = Tile_list.Building;
//   }
//
//   for (let i = 0; i < 30; i++) {
//     const x = Math.floor(Math.random() * Map_width);
//     const y = Math.floor(Math.random() * Map_height);
//     map2d[y][x] = Tile_list.Flower;
//   }
//
//   for (let i = 0; i < 15; i++) {
//     const x = Math.floor(Math.random() * Map_width);
//     const y = Math.floor(Math.random() * Map_height);
//     map2d[y][x] = Tile_list.Insect;
//   }
//
//   // 固定的に水タイルを設定
//   for (let i = 5; i < 20; i++) {
//     map2d[20][i] = Tile_list.Water;
//   }
//
//   // 中央の道を設定
//   for (let i = 0; i < Map_width; i++) {
//     const middle = Math.floor(Map_height / 2);
//     map2d[middle][i] = Tile_list.Path;
//   }
//
//   // アイテムをマップに反映
//   items.forEach((item) => {
//     const x = Math.floor(item.x / Tile_size); // ピクセル座標をタイル座標に変換
//     const y = Math.floor(item.y / Tile_size);
//
//     // 有効なタイル範囲内にあるかチェック
//     if (x >= 0 && x < Map_width && y >= 0 && y < Map_height) {
//       map2d[y][x] = "item"; // アイテムタイルとして設定
//     }
//   });
//
//   return map2d;
// };
// アイテムデータとマップ生成の実行
// export const items: Item[] = [
//   { id: 7, itemId: 19, x: 164, y: 358 },
//   { id: 8, itemId: 18, x: 443, y: 499 },
//   { id: 9, itemId: 17, x: 533, y: 223 },
//   { id: 10, itemId: 1, x: 362, y: 493 },
//   { id: 11, itemId: 10, x: 285, y: 67 },
//   { id: 12, itemId: 9, x: 31, y: 428 },
//   { id: 13, itemId: 21, x: 518, y: 166 },
//   { id: 14, itemId: 21, x: 112, y: 50 },
//   { id: 15, itemId: 17, x: 269, y: 340 },
//   { id: 16, itemId: 2, x: 563, y: 350 },
// ];

// export const Map_data = generateMap(items);
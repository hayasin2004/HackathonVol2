"use client";

import React, { useState, useEffect, KeyboardEvent } from "react";
import { Stage, Layer, Image } from "react-konva";
import {
  Tile_size,
  Map_width,
  Map_height,
  Tile_list,
  Map_data,
} from "./mapData";
// import { loadImage } from "canvas";

//プレイヤーをTile_sizeからx: 10 y: 10のところを取得する
const initialPlayerPosition = { x: 10 * Tile_size, y: 10 * Tile_size };

const MapWithCharacter = () => {
  const [playerPosition, setPlayerPosition] = useState(initialPlayerPosition);
  //最初は画像がないはずだからnullらしい
  const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  const [tileImages, setTileImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

  useEffect(() => {
    const tiles = Object.values(Tile_list);
    const loadedImages: { [key: string]: HTMLImageElement } = {};

    tiles.forEach((tile) => {
      const img = new window.Image();
      img.src = `/tiles/${tile}.png`;
      img.onload = () => {
        loadedImages[tile] = img;

        //全部読み込まれたら一気にリセット
        if (Object.keys(loadedImages).length === tiles.length) {
          setTileImages(loadedImages);
        }
      };
    });
  }, []);

  //画像がレンダリングされたときに一回だけ実行する（第二引数に[]を記入しているから）
  useEffect(() => {
    const img = new window.Image();
    img.src = "/character.png";
    img.onload = () => setPlayerImage(img);
  }, []);

  // const getTilecolor = (list: string) => {
  //   //switchはlistの値によって色を返している
  //   switch (list) {
  //     //Tile_listのGrassというケースの場合はreturnでカラーコードを返してあげる?
  //     case Tile_list.Grass:
  //       return "#74C365";
  //     case Tile_list.Path:
  //       return "#E5C07B";
  //     case Tile_list.Building:
  //       return "#8B5E3C";
  //     case Tile_list.Water:
  //       return "#4F94CD";
  //     case Tile_list.Tree:
  //       return "#228B22";
  //     case Tile_list.Leaves:
  //       return "#327040";
  //     case Tile_list.Stone:
  //       return "#747474";
  //     case Tile_list.Iron:
  //       return "#D1D1D1";
  //     case Tile_list.Coal:
  //       return "#2D2D2D";
  //     case Tile_list.Flower:
  //       return "#fa52e3";
  //     case Tile_list.Mushroom:
  //       return "#846847";
  //     case Tile_list.Insect:
  //       return "#ef5e3f";
  //     //デフォルトも草を設置
  //     default:
  //       return "#74C365";
  //   }
  // };

  const handlekeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    //イベントが発生しても、ページの読み込みをなくす
    e.preventDefault();
    let { x, y } = playerPosition;

    switch (e.key) {
      case "ArrowUp":
        //ArrowUpだと、y座標をTile_size分減らす
        y -= Tile_size;
        break;
      case "ArrowDown":
        y += Tile_size;
        break;
      case "ArrowLeft":
        x -= Tile_size;
        break;
      case "ArrowRight":
        x += Tile_size;
        break;
    }

    if (
      //MAP_WIDTH * TILE_SIZE → マップの幅（ピクセル単位）
      //MAP_HEIGHT * TILE_SIZE → マップの高さ（ピクセル単位）
      //x < MAP_WIDTH * TILE_SIZE → 右端を超えないようにする
      //y < MAP_HEIGHT * TILE_SIZE → 下端を超えないようにする
      x >= 0 &&
      y >= 0 &&
      x < Map_width * Tile_size &&
      y < Map_height * Tile_size
    ) {
      setPlayerPosition({ x, y });
      setCameraPosition({
        //Math.maxでカメラが0より下に行かないようにする
        //window.innerWidth,Heightでマップの真ん中を表し、x,yでマイナスするとユーザーの画面を真ん中に配置
        x: Math.max(0, x - window.innerWidth / 2),
        y: Math.max(0, y - window.innerHeight / 2),
      });
    }
  };

  console.log(playerPosition);

  return (
    <div tabIndex={0} onKeyDown={handlekeyDown} style={{ outline: "none" }}>
      <Stage
        width={typeof window !== "undefined" ? window.innerWidth : 0}
        height={typeof window !== "undefined" ? window.innerHeight : 0}
      >
        <Layer>
          {/* --- 1. Grass背景を全マスに描画 --- */}
          {Map_data.map((row, rowIndex) =>
            row.map((_, colIndex) => {
              const grassImg = tileImages["grass"];
              if (!grassImg) return null;

              return (
                <Image
                  key={`grass-${rowIndex}-${colIndex}`}
                  image={grassImg}
                  x={colIndex * Tile_size - cameraPosition.x}
                  y={rowIndex * Tile_size - cameraPosition.y}
                  width={Tile_size}
                  height={Tile_size}
                  alt="タイル画像"
                />
              );
            })
          )}

          {/* --- 2. タイルの上書き描画（透明含む） --- */}
          {Map_data.map((row, rowIndex) =>
            row.map((tile, colIndex) => {
              // grassはすでに描画されているのでスキップ
              if (tile === "grass") return null;

              const img = tileImages[tile];
              if (!img) return null;

              // 2x2サイズの判定（さっきのロジックと同じ）
              const isLargeTile =
                tile === "tree" ||
                tile === "stone" ||
                tile === "iron" ||
                tile === "coal";

              if (isLargeTile) {
                const isRightNeighborSame =
                  Map_data[rowIndex]?.[colIndex - 1] === tile;
                const isBottomNeighborSame =
                  Map_data[rowIndex - 1]?.[colIndex] === tile;
                const isBottomRightSame =
                  Map_data[rowIndex - 1]?.[colIndex - 1] === tile;

                if (
                  isRightNeighborSame ||
                  isBottomNeighborSame ||
                  isBottomRightSame
                ) {
                  return null; // スキップ（左上のみ描画）
                }

                return (
                  <Image
                    key={`${tile}-${rowIndex}-${colIndex}`}
                    image={img}
                    x={colIndex * Tile_size - cameraPosition.x}
                    y={rowIndex * Tile_size - cameraPosition.y}
                    width={Tile_size * 2}
                    height={Tile_size * 2}
                    alt="タイル画像"
                  />
                );
              }

              // 通常サイズのタイル
              return (
                <Image
                  key={`${tile}-${rowIndex}-${colIndex}`}
                  image={img}
                  x={colIndex * Tile_size - cameraPosition.x}
                  y={rowIndex * Tile_size - cameraPosition.y}
                  width={Tile_size}
                  height={Tile_size}
                  alt="タイル画像"
                />
              );
            })
          )}

          {/* --- プレイヤー --- */}
          {playerImage && (
            <Image
              image={playerImage}
              x={playerPosition.x - cameraPosition.x}
              y={playerPosition.y - cameraPosition.y}
              width={Tile_size}
              height={Tile_size}
              alt="プレイヤー"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default MapWithCharacter;

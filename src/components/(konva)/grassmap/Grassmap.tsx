"use client";

import React, { useState, useEffect, KeyboardEvent } from "react";
import { Stage, Layer, Rect, Image } from "react-konva";
import {
  Tile_size,
  Map_width,
  Map_height,
  Tile_list,
  Map_data,
} from "./mapData";
import {PlayerItem} from "@/types/playerItem";
import {useSocketConnection} from "@/hooks/(realTime)/connection/useScoketConnection";
import useRemakeItemGet from "@/hooks/(realTime)/test/useRemakeItemGet";

//プレイヤーをTile_sizeからx: 10 y: 10のところを取得する
const initialPlayerPosition = { x: 10 * Tile_size, y: 10 * Tile_size };

interface GameProps {
  playerId: PlayerItem;
  roomId: number;
}
const MapWithCharacter : React.FC<GameProps> = ({playerId, roomId}) => {



  const {socket, connected, players, items, error, movePlayer} = useSocketConnection(playerId.id, roomId);
  // プレイヤー移動
  const {ECollisionPosition, ECollisionStatus, adjacentObstacles} = useRemakeItemGet({
    userId: 1, // ユーザーID
    initialPosition: {x: playerId.x, y: playerId.y}, // 初期位置
    circleRadius: 30, // プレイヤーの範囲
    rectPositions: items,
    speed: 10, // 移動速度
    movePlayer
  });











  const [playerPosition, setPlayerPosition] = useState(initialPlayerPosition);
  //最初は画像がないはずだからnullらしい
  const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });

  //画像がレンダリングされたときに一回だけ実行する（第二引数に[]を記入しているから）
  useEffect(() => {
    const img = new window.Image();
    img.src = "/character.png";
    img.onload = () => setPlayerImage(img);
  }, []);

  const getTilecolor = (list: string) => {
    //switchはlistの値によって色を返している
    switch (list) {
      //Tile_listのGrassというケースの場合はreturnでカラーコードを返してあげる?
      case Tile_list.Grass:
        return "#74C365";
      case Tile_list.Path:
        return "#E5C07B";
      case Tile_list.Building:
        return "#8B5E3C";
      case Tile_list.Water:
        return "#4F94CD";
      case Tile_list.Tree:
        return "#228B22";
      case Tile_list.Leaves:
        return "#327040";
      case Tile_list.Stone:
        return "#747474";
      case Tile_list.Iron:
        return "#D1D1D1";
      case Tile_list.Coal:
        return "#2D2D2D";
      case Tile_list.Flower:
        return "#fa52e3";
      case Tile_list.Mushroom:
        return "#846847";
      case Tile_list.Insect:
        return "#ef5e3f";
      //デフォルトも草を設置
      default:
        return "#74C365";
    }
  };

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
          {Map_data.map((row, rowIndex) =>
            row.map((tile, colIndex) => (
              <Rect
                key={`${rowIndex}-${colIndex}`}
                x={colIndex * Tile_size - cameraPosition.x}
                y={rowIndex * Tile_size - cameraPosition.y}
                width={Tile_size}
                height={Tile_size}
                fill={getTilecolor(tile)}
              />
            ))
          )}
          {playerImage && (
            <Image
              image={playerImage}
              x={playerPosition.x - cameraPosition.x}
              y={playerPosition.y - cameraPosition.y}
              width={Tile_size}
              height={Tile_size}
              alt="プレイヤー写真"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default MapWithCharacter;

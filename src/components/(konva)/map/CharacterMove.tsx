"use client";

import Konva from "konva";
import { Stage, Layer, Image } from "react-konva";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";

const CharacterMove = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const imageRef = useRef<Konva.Image>(null); // 画像関係
  const [position, setPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });

  //ここよくわからないゾーン
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    console.log("x:", position.x);
    console.log("y:", position.y);
  });

  //ここよくわからないゾーン // 画像関係
  useEffect(() => {
    const img = new window.Image();
    img.src = "/kuma.png";
    img.onload = () => {
      setImage(img);
    };
  }, []);

  useEffect(() => {
    if (stageRef.current) {
      const container = stageRef.current.container();
      container.tabIndex = 1;
      container.focus();
      container.addEventListener("keydown", handleKeyDown);
      return () => container.removeEventListener("keydown", handleKeyDown);
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    const DELTA = 4;

    switch (e.key) {
      case "ArrowLeft":
        setPosition((prevPosition) => ({
          ...prevPosition,
          x: prevPosition.x - DELTA,
        }));
        break;
      case "ArrowUp":
        setPosition((prevPosition) => ({
          ...prevPosition,
          y: prevPosition.y - DELTA,
        }));
        break;
      case "ArrowRight":
        setPosition((prevPosition) => ({
          ...prevPosition,
          x: prevPosition.x + DELTA,
        }));
        break;
      case "ArrowDown":
        setPosition((prevPosition) => ({
          ...prevPosition,
          y: prevPosition.y + DELTA,
        }));
        break;
      default:
        return;
    }
  };

  // console.log(window);
  console.log(position.x);
  console.log(position.y);
  // e.preventDefault();

  return (
    <Stage
      width={typeof window !== "undefined" ? window.innerWidth : 0}
      height={typeof window !== "undefined" ? window.innerHeight : 0}
      ref={stageRef}
      //   onKeyDown={handleKeyDown}
    >
      <Layer>
        {image && ( // 画像関係
          <Image
            ref={imageRef}
            image={image}
            x={position.x}
            y={position.y}
            width={100}
            height={100}
            // draggable
            alt="ユーザーキャラクター"
          />
        )}
        {/* <Circle
          x={position.x}
          y={position.y}
          radius={50}
          fill="red"
          stroke="black"
          strokeWidth={4}
        /> */}
      </Layer>
    </Stage>
  );
};
export default CharacterMove;

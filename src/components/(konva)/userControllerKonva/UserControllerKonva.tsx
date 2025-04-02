"use client";
import React, { useState } from "react";
import { CharacterPartsType } from "@/types/character";
import { Circle, Layer, Stage } from "react-konva";
import { useKeyboardControl } from "@/hooks/(animation)/onlyKeydown/useOnlyKeydown";
import { useOnlyAuto } from "@/hooks/(animation)/onlyAuto/useOnlyAuto";

const UserControllerKonva: React.FC<CharacterPartsType> = (props) => {
  const [AutoPosition, setAutoPosition] = useState({ x: 100, y: 100 });
  const [inputSpeed, setInputSpeed] = useState(30);
  const parts = props.character?.parts;

  //   キーボード操作用のカスタムック使用例;
  const [keyDownPosition, setKeyDownPosition] = useState({ x: 100, y: 100 });
  const updatePosition = (deltaX: number, deltaY: number) => {
    setKeyDownPosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  };
  useKeyboardControl(updatePosition);

  // 自動動作カスタムフック使用例

  // 自動動作カスタムフック使用例
  //   const { autoActionPosition } = useOnlyAuto(
  //     { x: parts.x, y: parts.y },
  //     inputSpeed
  //   );
  return (
    <div>
      <h1>ここで実際に操作をする</h1>
      <Stage
        width={typeof window !== "undefined" ? window.innerWidth : 0}
        height={typeof window !== "undefined" ? window.innerHeight : 0}
      >
        <Layer>
          <Circle
            x={keyDownPosition.x}
            y={keyDownPosition.y}
            radius={50}
            fill="red"
            stroke="black"
            strokeWidth={4}
          />
        </Layer>
      </Stage>
      {/*<br/>*/}
      {/*<label htmlFor="speed">速さ調整</label>*/}
      {/*<input type="text" name={"speed"} onChange={(e) => setInputSpeed(e.target.value)}></input>*/}
    </div>
  );
};

export default UserControllerKonva;

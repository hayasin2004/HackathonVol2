"use client"
import React, {useState} from 'react';
import {CharacterPartsType} from "@/types/character";
import {Circle, Layer, Rect, Stage} from "react-konva";
import {useKeyboardControl} from "@/hooks/(animation)/onlyKeydown/useOnlyKeydown";
import {useOnlyAuto} from "@/hooks/(animation)/onlyAuto/useOnlyAuto";
import useCollisionWithKeyboard from "@/hooks/(animation)/collision/useCollisionWithKeyboard";
import useEventHappen from "@/hooks/(animation)/eventHappen/useEventHappen";

const UserControllerKonva: React.FC<CharacterPartsType> = (props) => {
    const [keyDownPosition, setKeyDownPosition] = useState({x: 100, y: 100})
    const [AutoPosition, setAutoPosition] = useState({x: 100, y: 100})
    const parts = props.character?.parts
    const rectPosition = {x: 200, y: 100, width: 100, height: 100}; // 障害物の矩形情報
    const circleRadius = 30; //
    // キーボード操作用のカスタムック使用例
    // const updatePosition = (deltaX: number, deltaY: number) => {
    //     setKeyDownPosition((prev) => ({
    //         x: prev.x + deltaX,
    //         y: prev.y + deltaY,
    //     }));
    // };
    // useKeyboardControl(updatePosition);


    // 衝突よう
    // const {collisionKeyDownPosition, collisionStatus} = useCollisionWithKeyboard(
    //     {x: 100, y: 100}, // 円の初期位置
    //     rectPosition,
    //     circleRadius
    // );


    // 衝突＋イベント
    const {collisionKeyDownPosition, collisionKeyDownColliding} = useEventHappen(
        {x: 100, y: 100},
        circleRadius,
        rectPosition,
    )


    // // // 自動動作カスタムフック使用例
    // const [inputSpeed, setInputSpeed] = useState(30)
    // const {autoActionPosition} = useOnlyAuto({x :parts.x ,y: parts.y} ,inputSpeed)
    return (
        <div>
            <h1>ここで実際に操作をする</h1>
            <Stage
                width={typeof window !== "undefined" ? window.innerWidth : 0}
                height={typeof window !== "undefined" ? window.innerHeight : 0}
            >
                <Layer>
                    {/*キー操作*/}
                    {/*<Circle {...parts} x={keyDownPosition.x} y={keyDownPosition.y}*/}
                    {/*        fill={collisionStatus ? "green" : "red"}></Circle>*/}

                    {/*自動で動くやつを呼び出す*/}
                    {/*<Circle {...parts} x={autoActionPosition.x} y={autoActionPosition.y}></Circle>*/}

                    衝突＋キー操作
                    {/*<Circle {...parts} x={collisionKeyDownPosition.x} y={collisionKeyDownPosition.y}*/}
                    {/*        fill={collisionStatus ? "green" : "red"}></Circle>*/}

                    {/*衝突 + イベント*/}
                    <Circle {...parts} x={collisionKeyDownPosition.x} y={collisionKeyDownPosition.y}
                            fill={collisionKeyDownColliding ? "#ecee33" : "#1c027f"}></Circle>

                    <Rect
                        x={rectPosition.x}
                        y={rectPosition.y}
                        width={rectPosition.width}
                        height={rectPosition.height}
                        fill="red"
                    />

                </Layer>
            </Stage>
            {/*<br/>*/}
            {/*<label htmlFor="speed">速さ調整</label>*/}
            {/*<input type="text" name={"speed"} onChange={(e) => setInputSpeed(e.target.value)}></input>*/}
        </div>
    );
}


export default UserControllerKonva;
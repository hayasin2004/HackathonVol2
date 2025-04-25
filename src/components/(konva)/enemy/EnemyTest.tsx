// src/components/(konva)/enemy/EnemyTest.tsx
"use client"
import React, {useCallback, useEffect, useState} from 'react';
import {Stage, Layer, Group, Image, Text} from "react-konva";
import useImage from "use-image";
import {Enemy} from "@/types/enemy";
import useEnemyRandomMovement from "@/hooks/(animation)/enemy/randomEnemy/useEnemyRandomMovement";
import useEnemyLinearRandomMovement from "@/hooks/(animation)/enemy/linearEnemy/useEnemyLinearRandomMovement";

interface PropsNpcData {
    enemyData: Enemy[] | null
    cameraPosition: { x: number, y: number }
    ECollisionPosition: { x: number, y: number }
}

const currentStage = 1;

const onInteract = (enemy: Enemy, dialogue: any) => {
    console.log("NPCと対話:", enemy.name, dialogue);
};

const EnemyTest: React.FC<PropsNpcData> = ({enemyData, cameraPosition, ECollisionPosition}) => {
    const [dialogue, setDialogue] = useState<string | null>(null);
    if (!enemyData || enemyData.length === 0) {
        return <div>Enemyデータがありません</div>;
    }


    return (
        <div>
            {enemyData?.map((enemy) => (
                <SingleEnemy key={enemy?.id} cameraPosition={cameraPosition} enemy={enemy} setDialogue={setDialogue}
                             ECollisionPosition={ECollisionPosition}/>
            ))}
            {dialogue && (
                <div className="dialog">
                    <p>{dialogue}</p>
                    <button onClick={() => setDialogue(null)}>Close</button>
                </div>
            )}
        </div>
    );
};

const SingleEnemy: React.FC<{
    enemy: Enemy,
    cameraPosition: { x: number, y: number },
    setDialogue: React.Dispatch<React.SetStateAction<string | null>>,
    ECollisionPosition: { x: number, y: number }
}> = ({enemy, cameraPosition, setDialogue, ECollisionPosition}) => {
    const imageIndex = 1;
    const validImageIndex = enemy.images.length > imageIndex ? imageIndex : 0;
    const [isColliding, setIsColliding] = useState(false);
    const [image] = useImage(enemy.images[validImageIndex]);
    if (enemy.stageStatus !== currentStage) {
        return null;
    }

    const handleClick = () => {
        const dialogues = typeof enemy.dialogues === 'string'
            ? JSON.parse(enemy.dialogues)
            : enemy.dialogues;
        if (dialogues && Array.isArray(dialogues) && dialogues.length > 0) {
            onInteract(enemy, dialogues[0]);
            setDialogue(dialogues[1]);
        }
    };

    const enemyTalk = () => {
        // dialoguesが配列であることを確認し、インデックス1の要素を返す
        if (Array.isArray(enemy.dialogues) && enemy.dialogues.length > 1) {
            return enemy.dialogues[1]; // インデックス1の要素を返す
        }
        return ""; // デフォルトで空文字列を返す
    }


    let position, showDialog;
    if (enemy.movementPattern.type === "random") {
        ({position, showDialog} = useEnemyRandomMovement(enemy?.x, enemy?.y));
    } else if (enemy.movementPattern.type === "linear") {
        const linearMovement = useEnemyLinearRandomMovement(enemy?.x, enemy?.y);
        position = linearMovement.linearPosition;
        showDialog = linearMovement.showDialog;
    } else {
        // random でも linear でもない場合、初期位置を使用
        position = {x: enemy?.x, y: enemy?.y};
        showDialog = false;
    }

    const checkCollision = useCallback((player, enemy) => {
        const playerLeft = player?.x;
        const playerRight = player?.x + 50;
        const playerTop = player?.y;
        const playerBottom = player?.y + 50;

        const enemyLeft = enemy.x;
        const enemyRight = enemy.x + 50;
        const enemyTop = enemy.y;
        const enemyBottom = enemy.y + 50;

        return !(
            playerRight < enemyLeft ||
            playerLeft > enemyRight ||
            playerBottom < enemyTop ||
            playerTop > enemyBottom
        );
    }, []);

    useEffect(() => {
        console.log("敵との衝突検知" + ECollisionPosition?.x)
        const collision = checkCollision(ECollisionPosition, position);
        setIsColliding(collision);
    }, [ECollisionPosition, position]);


    if (isColliding) {
        console.log(isColliding)
        console.log("小トス")
    }
    return (
        <Group
            x={position.x - cameraPosition.x}
            y={position.y - cameraPosition.y}
            width={enemy.x}
            height={enemy.y}
            cursor="pointer"
            onClick={handleClick}
            onTap={handleClick}
        >
            {image && (
                <Image
                    image={image}
                    width={64}
                    height={64}
                />
            )}
            <Text
                text={enemy.name}
                y={-20}
                fontSize={12}
                fill="red"
                align="center"
                width={64}
            />
            {showDialog && (
                <Text
                    text={enemyTalk()}
                    y={-60}
                    fontSize={14}
                    fill="blue"
                    align="center"
                    width={100}
                />
            )}
        </Group>
    );
};

export default EnemyTest;
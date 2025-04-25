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
    const [globalMouseDown, setGlobalMouseDown] = useState(false);

    // グローバルなマウスダウンイベントを監視
    useEffect(() => {
        const handleGlobalMouseDown = (e) => {
            if (e.button === 0) { // 左クリックの場合
                setGlobalMouseDown(true);

                // 少し遅延を入れてフラグをリセット
                setTimeout(() => {
                    setGlobalMouseDown(false);
                }, 100);
            }
        };

        window.addEventListener('mousedown', handleGlobalMouseDown);
        return () => {
            window.removeEventListener('mousedown', handleGlobalMouseDown);
        };
    }, []);

    if (!enemyData || enemyData.length === 0) {
        return <div>Enemyデータがありません</div>;
    }

    return (
        <div>
            {enemyData?.map((enemy) => (
                <SingleEnemy
                    key={enemy?.id}
                    cameraPosition={cameraPosition}
                    enemy={enemy}
                    setDialogue={setDialogue}
                    ECollisionPosition={ECollisionPosition}
                    globalMouseDown={globalMouseDown}
                />
            ))}
            {dialogue && (
                <div className="dialog" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '5px',
                    zIndex: 1000
                }}>
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
    ECollisionPosition: { x: number, y: number },
    globalMouseDown: boolean
}> = ({enemy, cameraPosition, setDialogue, ECollisionPosition, globalMouseDown}) => {
    const imageIndex = 1;
    const validImageIndex = enemy.images.length > imageIndex ? imageIndex : 0;
    const [isColliding, setIsColliding] = useState(false);
    const [image] = useImage(enemy.images[validImageIndex]);

    if (enemy.stageStatus !== currentStage) {
        return null;
    }

    // 通常のクリックハンドラ（敵をクリックした時）
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

    const checkCollision = useCallback((player, enemy, padding = 10) => {
        // paddingを使用して衝突判定の範囲を調整
        const playerLeft = player.x - padding;
        const playerRight = player.x + 50 + padding;
        const playerTop = player.y - padding;
        const playerBottom = player.y + 50 + padding;

        const enemyLeft = enemy.x - padding;
        const enemyRight = enemy.x + 50 + padding;
        const enemyTop = enemy.y - padding;
        const enemyBottom = enemy.y + 50 + padding;

        return !(
            playerRight < enemyLeft ||
            playerLeft > enemyRight ||
            playerBottom < enemyTop ||
            playerTop > enemyBottom
        );
    }, []);

    useEffect(() => {
        const collision = checkCollision(ECollisionPosition, position);
        setIsColliding(collision);
    }, [ECollisionPosition, position, checkCollision]);

    // 衝突中に左クリックされた場合のログ出力
    useEffect(() => {
        if (isColliding && globalMouseDown) {
            console.log("衝突中に左クリックされました！");
            console.log(`敵の名前: ${enemy.name}`);
            console.log(`敵の位置: x=${position.x}, y=${position.y}`);
            console.log(`敵の移動パターン: ${enemy.movementPattern.type}`);
            console.log(`プレイヤーの位置: x=${ECollisionPosition.x}, y=${ECollisionPosition.y}`);
        }
    }, [isColliding, globalMouseDown, enemy, position, ECollisionPosition]);

    if (isColliding) {
        console.log("小トス");
    }

    return (
        <Group
            x={position.x - cameraPosition.x}
            y={position.y - cameraPosition.y}
            width={64}
            height={64}
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
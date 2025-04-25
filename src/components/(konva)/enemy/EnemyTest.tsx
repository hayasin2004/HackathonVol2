"use client"
import React, {useEffect, useRef, useState} from 'react';
import {Stage, Layer, Group, Image, Text} from "react-konva";
import useImage from "use-image";
import {Enemy} from "@/types/enemy";
import useEnemyRandomMovement from "@/hooks/(animation)/enemy/randomEnemy/useEnemyRandomMovement";

interface PropsNpcData {
    enemyData: Enemy[] | null
}

// 現在のステージを定義（この変数がどこかで定義されている必要があります）
const currentStage = 1; // 仮の値、実際の値に置き換えてください

// onInteract関数の型定義（この関数がどこかで定義されている必要があります）
const onInteract = (enemy: Enemy, dialogue: any) => {
    // 対話処理の実装
    console.log("NPCと対話:", enemy.name, dialogue);
};

const EnemyTest: React.FC<PropsNpcData> = ({enemyData}) => {
    console.log(enemyData);

    if (!enemyData || enemyData.length === 0) {
        return <div>Enemyデータがありません</div>;
    }

    // Konvaコンポーネントは必ずStageとLayerの中に配置する
    return (
        <Stage
            width={typeof window !== "undefined" ? window.innerWidth : 0}
            height={typeof window !== "undefined" ? window.innerHeight : 0}
        >
            <Layer>
                {enemyData.map((enemy, index) => (
                    <SingleEnemy key={enemy.id} enemy={enemy}/>
                ))}
            </Layer>
        </Stage>
    );
};

// 単一のNPCを表示するコンポーネント
const SingleEnemy: React.FC<{ enemy: Enemy }> = ({enemy}) => {
    // 2枚目の画像を表示するために、インデックスを1に設定
    // 配列の2番目の要素（インデックス1）を使用
    const imageIndex = 1; // 2枚目の画像を固定で表示
    
    // 敵をランダムに動かすヤツ
    const position = useEnemyRandomMovement(enemy.x, enemy.y, enemy.movementPattern.type);


    // 画像が存在するかチェック
    const validImageIndex = enemy.images.length > imageIndex ? imageIndex : 0;

    // 指定したインデックスの画像を使用
    const [image] = useImage(enemy.images[validImageIndex]);

    // アニメーションを使用しない場合は以下のコードは不要
    // const animationRef = useRef<number | null>(null);
    // const lastFrameTime = useRef<number>(0);
    // const FRAME_RATE = 5; // フレームレート（秒間5フレーム）

    // NPCのステージステータスが現在のステージと一致する場合のみ表示
    if (enemy.stageStatus !== currentStage) {
        return null;
    }

    // アニメーションを使用しない場合はuseEffectも不要
    /*
    useEffect(() => {
        // スプライトアニメーションの実装
        const animate = (time: number) => {
            if (time - lastFrameTime.current >= 1000 / FRAME_RATE) {
                setCurrentImageIndex((prev) => (prev + 1) % enemy.images.length);
                lastFrameTime.current = time;
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [enemy.images.length]);
    */

    const handleClick = () => {　
        // NPCとの対話を開始
        // dialoguesがJsonValueの場合、適切に処理する必要があります
        const dialogues = typeof enemy.dialogues === 'string'
            ? JSON.parse(enemy.dialogues)
            : enemy.dialogues;
        console.log(Array.isArray(dialogues) )
        // 対話が存在する場合、最初の対話を表示
        if (dialogues && Array.isArray(dialogues) && dialogues.length > 0) {
            onInteract(enemy, dialogues[0]);


            alert(dialogues[1]);
        }
    };

    return (
        <Group
            x={position.x}
            y={position.y}
            width={100}
            height={100}
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
        </Group>
    );
};

export default EnemyTest;
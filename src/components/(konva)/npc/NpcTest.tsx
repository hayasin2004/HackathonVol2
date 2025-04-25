"use client"
import React, {useEffect, useRef, useState} from 'react';
import {NPC} from "@/types/npc";
import {Stage, Layer, Group, Image, Text} from "react-konva";
import useImage from "use-image";

interface PropsNpcData {
    npcData: NPC[] | null
}

// 現在のステージを定義（この変数がどこかで定義されている必要があります）
const currentStage = 1; // 仮の値、実際の値に置き換えてください

// onInteract関数の型定義（この関数がどこかで定義されている必要があります）
const onInteract = (npc: NPC, dialogue: any) => {
    // 対話処理の実装
    console.log("NPCと対話:", npc.name, dialogue);
};

const NpcTest: React.FC<PropsNpcData> = ({npcData}) => {
    console.log(npcData);

    if (!npcData || npcData.length === 0) {
        return <div>NPCデータがありません</div>;
    }

    // Konvaコンポーネントは必ずStageとLayerの中に配置する
    return (
        <Stage
            width={typeof window !== "undefined" ? window.innerWidth : 0}
            height={typeof window !== "undefined" ? window.innerHeight : 0}
        >
            <Layer>
                {npcData.map((npc, index) => (
                    <SingleNpc key={npc.id} npc={npc}/>
                ))}
            </Layer>
        </Stage>
    );
};

// 単一のNPCを表示するコンポーネント
const SingleNpc: React.FC<{ npc: NPC }> = ({npc}) => {
    // 2枚目の画像を表示するために、インデックスを1に設定
    // 配列の2番目の要素（インデックス1）を使用
    const imageIndex = 1; // 2枚目の画像を固定で表示

    // 画像が存在するかチェック
    const validImageIndex = npc.images.length > imageIndex ? imageIndex : 0;

    // 指定したインデックスの画像を使用
    const [image] = useImage(npc.images[validImageIndex]);

    // アニメーションを使用しない場合は以下のコードは不要
    // const animationRef = useRef<number | null>(null);
    // const lastFrameTime = useRef<number>(0);
    // const FRAME_RATE = 5; // フレームレート（秒間5フレーム）

    // NPCのステージステータスが現在のステージと一致する場合のみ表示
    if (npc.stageStatus !== currentStage) {
        return null;
    }

    // アニメーションを使用しない場合はuseEffectも不要
    /*
    useEffect(() => {
        // スプライトアニメーションの実装
        const animate = (time: number) => {
            if (time - lastFrameTime.current >= 1000 / FRAME_RATE) {
                setCurrentImageIndex((prev) => (prev + 1) % npc.images.length);
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
    }, [npc.images.length]);
    */

    const handleClick = () => {　
        // NPCとの対話を開始
        // dialoguesがJsonValueの場合、適切に処理する必要があります
        const dialogues = typeof npc.dialogues === 'string'
            ? JSON.parse(npc.dialogues)
            : npc.dialogues;
        console.log(Array.isArray(dialogues) )
        // 対話が存在する場合、最初の対話を表示
        if (dialogues && Array.isArray(dialogues) && dialogues.length > 0) {
            onInteract(npc, dialogues[0]);
            alert(`対話: ${dialogues[0]}`);
        }
    };

    return (
        <Group
            x={npc.positionX}
            y={npc.positionY}
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
                text={npc.name}
                y={-20}
                fontSize={12}
                fill="white"
                align="center"
                width={64}
            />
        </Group>
    );
};

export default NpcTest;
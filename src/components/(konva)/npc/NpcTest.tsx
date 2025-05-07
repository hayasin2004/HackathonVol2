"use client"
import React, {useEffect, useRef, useState} from 'react';
import {NPC} from "@/types/npc";
import {Stage, Layer, Group, Image, Text} from "react-konva";
import useImage from "use-image";
import DialogueBox from './DialogueBox'; // DialogueBoxコンポーネントをインポート

interface PropsNpcData {
    npcData: NPC[] | null
    cameraPosition: { x: number, y: number }

}

// 現在のステージを定義（この変数がどこかで定義されている必要があります）
const currentStage = 1; // 仮の値、実際の値に置き換えてください

// onInteract関数の型定義（この関数がどこかで定義されている必要があります）
const onInteract = (npc: NPC, dialogue: any) => {
    // 対話処理の実装
    console.log("NPCと対話:", npc.name, dialogue);
};

const NpcTest: React.FC<PropsNpcData> = ({npcData, cameraPosition}) => {
    console.log(npcData);

    // --- 対話ボックスの状態管理 ---
    // isVisible: 対話ボックスが表示されているか
    // npc: 現在対話しているNPCのデータ (nullの場合は表示しない)
    const [activeDialogue, setActiveDialogue] = useState<{
        isVisible: boolean,
        npc: NPC | null,
        currentIndex: number // 現在表示中のダイアログインデックス
    }>({
        isVisible: false,
        npc: null,
        currentIndex: 0
    });
    // --- ここまで ---

    // NPCがクリックされたときに呼び出されるハンドラ
    // ダイアログ自動進行用のタイマー参照
    const dialogueTimerRef = useRef<NodeJS.Timeout | null>(null);

    // NPCがクリックされたときに呼び出されるハンドラ
    const handleNpcClick = (clickedNpc: NPC) => {
        // 既にダイアログが表示されている場合はタイマーをクリア
        if (dialogueTimerRef.current) {
            clearInterval(dialogueTimerRef.current);
            dialogueTimerRef.current = null;
        }

        // クリックされたNPCのダイアログを取得
        const dialogues = typeof clickedNpc.dialogues === 'string'
            ? JSON.parse(clickedNpc.dialogues)
            : clickedNpc.dialogues;

        const hasDialogue = dialogues && Array.isArray(dialogues) && dialogues.length > 0;

        if (activeDialogue.isVisible && activeDialogue.npc?.id === clickedNpc.id) {
            // 現在表示中のNPCを再度クリックした場合は、対話ボックスを非表示にする
            setActiveDialogue({isVisible: false, npc: null, currentIndex: 0});
        } else if (hasDialogue) {
            // 別のNPCをクリックした場合、または対話ボックスが非表示の場合は、そのNPCの対話ボックスを表示
            setActiveDialogue({isVisible: true, npc: clickedNpc, currentIndex: 0});

            // ID=1のNPCの場合、自動的にダイアログを進行
            if (clickedNpc.id === 1) {
                // 2秒ごとにダイアログを進行するタイマーを設定
                dialogueTimerRef.current = setInterval(() => {
                    setActiveDialogue(prev => {
                        // ダイアログの配列を取得
                        const dialogArray = typeof clickedNpc.dialogues === 'string'
                            ? JSON.parse(clickedNpc.dialogues)
                            : clickedNpc.dialogues;

                        // 次のインデックス
                        const nextIndex = prev.currentIndex + 1;

                        // 最後のダイアログまで表示したらタイマーを停止
                        if (nextIndex >= dialogArray.length) {
                            if (dialogueTimerRef.current) {
                                clearInterval(dialogueTimerRef.current);
                                dialogueTimerRef.current = null;
                            }
                            return prev; // インデックスを更新しない
                        }

                        // 次のダイアログを表示
                        return {
                            ...prev,
                            currentIndex: nextIndex
                        };
                    });
                }, 2500); // 2秒ごと
            }
        } else {
            // ダイアログがないNPCがクリックされた場合は、対話ボックスを非表示にする
            setActiveDialogue({isVisible: false, npc: null, currentIndex: 0});
        }
    };

    // NpcTest.tsx内で、ダイアログを閉じる関数を追加
    const handleCloseDialogue = () => {
        // ダイアログを閉じる
        setActiveDialogue({
            isVisible: false,
            npc: null,
            currentIndex: 0
        });

        // タイマーがある場合はクリア
        if (dialogueTimerRef.current) {
            clearInterval(dialogueTimerRef.current);
            dialogueTimerRef.current = null;
        }
    };


    // コンポーネントのアンマウント時にタイマーをクリア
    useEffect(() => {
        return () => {
            if (dialogueTimerRef.current) {
                clearInterval(dialogueTimerRef.current);
            }
        };
    }, []);

    if (!npcData || npcData.length === 0) {
        return <div>NPCデータがありません</div>;
    }

    // Konvaコンポーネントは必ずStageとLayerの中に配置する
    return (
        <>
            {npcData.map((npc) => (
                <SingleNpc
                    key={npc.id}
                    npc={npc}
                    cameraPosition={cameraPosition} // cameraPositionを渡す
                    onNpcClick={handleNpcClick} // クリックハンドラを渡す
                />
            ))}

            {/* 対話ボックスを描画 */}
            <DialogueBox
                activeDialogue={{
                    isVisible: activeDialogue.isVisible,
                    npc: activeDialogue.npc,
                    currentIndex: activeDialogue.currentIndex,// 現在のインデックスを渡す
                }}
                onClose={handleCloseDialogue}
            />
        </>
    );
};

// 単一のNPCを表示するコンポーネント (修正済み)
interface PropsSingleNpc {
    npc: NPC;
    onNpcClick: (npc: NPC) => void; // 新しく追加したプロパティ
    cameraPosition: { x: number, y: number }

}

const SingleNpc: React.FC<PropsSingleNpc> = ({npc, onNpcClick, cameraPosition}) => { // プロパティでonNpcClickを受け取る
    // ローカルの吹き出し関連の状態とロジックを削除
    // const [isBubbleVisible, setIsBubbleVisible] = useState(false);
    // const [bubbleText, setBubbleText] = useState('');

    // マップ上のスプライト画像は imageIndex = 1 を使用（元のコードから変更なし）
    const imageIndex = 1;
    const validImageIndex = npc.images.length > imageIndex ? imageIndex : 0;

    // 指定したインデックスの画像を使用
    const [image] = useImage(npc.images[validImageIndex]);

    const [position, setPosition] = useState({x: npc.x, y: npc.y});
    // 現在のステージにいないNPCは描画しない
    if (npc.stageStatus !== currentStage) {
        return null;
    }

    useEffect(() => {
        // 移動が完了したかどうかをみるかあああああああああああああ
        let isMounted = true;

        if (npc.id === 1) {
            // 水平方向に移動するロジック（まずX軸、次にY軸）
            const moveToDestination = async () => {
                const targetX = 64;
                const targetY = 128;

                let currentX = npc.x;
                let currentY = npc.y;

                setPosition({x: currentX, y: currentY});

                while (currentX > targetX && isMounted) {
                    await new Promise(resolve => setTimeout(resolve, 150));
                    currentX -= 64;
                    setPosition(prev => ({x: currentX, y: prev.y}));
                }

                // 次にY軸方向に移動（上へ）
                while (currentY > targetY && isMounted) {
                    await new Promise(resolve => setTimeout(resolve, 150));
                    currentY -= 64;
                    setPosition(prev => ({x: prev.x, y: currentY}));
                }

                // コンポーネントがアンマウントされていなければダイアログを表示
                if (isMounted) {
                    // 終点に到達したらダイアログを表示
                    // 少し遅延を入れてから表示
                    await new Promise(resolve => setTimeout(resolve, 300));
                    onNpcClick(npc);
                }
            };

            // 移動開始
            moveToDestination();
        }

        // クリーンアップ関数
        return () => {
            isMounted = false;
        };
    }, []);

    const handleClick = () => {

        onNpcClick(npc);
    };

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
                    listening={true}
                    hitStrokeWidth={0}
                    shadowColor="black"
                    shadowBlur={5}
                    shadowOpacity={0.5}
                />
            )}
        </Group>
    );
};

export default NpcTest;
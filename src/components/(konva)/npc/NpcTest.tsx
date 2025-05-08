"use client"
import React, {useEffect, useRef, useState} from 'react';
import {NPC} from "@/types/npc";
import {Stage, Layer, Group, Image, Text} from "react-konva";
import useImage from "use-image";
import DialogueBox from './DialogueBox';
import Grassmap from "@/components/(konva)/grassmap/Grassmap";

interface PropsNpcData {
    npcData: NPC[] | null
    cameraPosition: { x: number, y: number }
    onDialogOpen?: (isOpen: boolean) => void;
}

// NPCの対話状態を管理する型
interface NpcDialogueState {
    [npcId: number]: {
        hasHeardDialogue: boolean;
        lastInteractionDate: string;
    }
}

// 現在のステージを定義（この変数がどこかで定義されている必要があります）
const currentStage = 1; // 仮の値、実際の値に置き換えてください

// onInteract関数の型定義（この関数がどこかで定義されている必要があります）
const onInteract = (npc: NPC, dialogue: any) => {
    // 対話処理の実装
    console.log("NPCと対話:", npc.name, dialogue);
};

const NpcTest: React.FC<PropsNpcData> = ({npcData, cameraPosition,onDialogOpen}) => {
    console.log(npcData);
    const [activeDialogue, setActiveDialogue] = useState<{
        isVisible: boolean;
        npc: NPC | null;
        currentIndex?: number;
    }>({
        isVisible: false,
        npc: null,
        currentIndex: 0
    });

    // NPCの対話状態を管理するstate
    const [npcDialogueStates, setNpcDialogueStates] = useState<NpcDialogueState>({});

    // ローカルストレージからNPCの対話状態を読み込む
    useEffect(() => {
        const savedStates = localStorage.getItem('npcDialogueStates');
        if (savedStates) {
            try {
                setNpcDialogueStates(JSON.parse(savedStates));
            } catch (e) {
                console.error('NPCの対話状態の読み込みに失敗しました:', e);
            }
        }
    }, []);

    // NPCの対話状態を保存する関数
    const saveNpcDialogueState = (npcId: number) => {
        const updatedStates = {
            ...npcDialogueStates,
            [npcId]: {
                hasHeardDialogue: true,
                lastInteractionDate: new Date().toISOString()
            }
        };

        setNpcDialogueStates(updatedStates);
        localStorage.setItem('npcDialogueStates', JSON.stringify(updatedStates));
    };

    // NPCの対話状態をチェックする関数
    const hasHeardDialogue = (npcId: number): boolean => {
        return npcDialogueStates[npcId]?.hasHeardDialogue || false;
    };

    // --- 対話ボックスの状態管理 ---
    // Grassmapに通知😢

    useEffect(() => {
        if (onDialogOpen) {
            onDialogOpen(activeDialogue.isVisible);
        }
    }, [activeDialogue.isVisible, onDialogOpen]);

    // NPCとの対話を開始する関数
    const startDialogue = (npc: NPC) => {
        setActiveDialogue({
            isVisible: true,
            npc: npc,
            currentIndex: 0
        });
    };

    // ダイアログを閉じる関数
    const closeDialogue = () => {
        setActiveDialogue({
            isVisible: false,
            npc: null
        });
    };

    // ダイアログ自動進行用のタイマー参照
    const dialogueTimerRef = useRef<NodeJS.Timeout | null>(null);

    // NPCがクリックされたときに呼び出されるハンドラ
    const handleNpcClick = (clickedNpc: NPC, isAutomatic = false) => {
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
            // 自動表示の場合は、まだ聞いていない場合のみダイアログを表示
            // クリックの場合は常にダイアログを表示
            if (!isAutomatic || (isAutomatic && !hasHeardDialogue(clickedNpc.id))) {
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

                                // 自動表示の場合のみ、ダイアログが終了したら対話状態を保存
                                if (isAutomatic) {
                                    saveNpcDialogueState(clickedNpc.id);
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

        // 自動表示の場合のみ、ダイアログが閉じられた時に対話状態を保存
        // （クリックで表示した場合は保存しない）
        // この部分は自動表示かどうかの情報がないため、実装が難しい
        // 必要であれば、activeDialogueに自動表示かどうかのフラグを追加する
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
                    onNpcClick={(npc) => handleNpcClick(npc, false)} // クリックハンドラを渡す（isAutomaticはfalse）
                    hasHeardDialogue={hasHeardDialogue(npc.id)} // 対話状態を渡す
                    onAutoDialogue={(npc) => handleNpcClick(npc, true)} // 自動対話用のハンドラを渡す（isAutomaticはtrue）
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
    onNpcClick: (npc: NPC) => void;
    onAutoDialogue: (npc: NPC) => void; // 自動対話用のハンドラを追加
    cameraPosition: { x: number, y: number };
    hasHeardDialogue: boolean;
}

const SingleNpc: React.FC<PropsSingleNpc> = ({npc, onNpcClick, onAutoDialogue, cameraPosition, hasHeardDialogue}) => {
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

                // コンポーネントがアンマウントされていなければ、まだ聞いていない場合のみ自動対話を開始
                if (isMounted && !hasHeardDialogue) {
                    // 終点に到達したらダイアログを表示
                    // 少し遅延を入れてから表示
                    await new Promise(resolve => setTimeout(resolve, 300));
                    onAutoDialogue(npc); // 自動対話用のハンドラを使用
                }
            };

            // 移動開始
            moveToDestination();
        }

        // クリーンアップ関数
        return () => {
            isMounted = false;
        };
    }, [hasHeardDialogue, npc, onAutoDialogue]); // 依存配列から hasHeardDialogue を削除（自動対話の判断はハンドラ内で行う）

    const handleClick = () => {
        onNpcClick(npc); // 通常のクリックハンドラを使用
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
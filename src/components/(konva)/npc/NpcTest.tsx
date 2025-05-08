"use client";
import React, {useEffect, useRef, useState} from "react";
import {NPC} from "@/types/npc";
import {Stage, Layer, Group, Image} from "react-konva";
import useImage from "use-image";
import DialogueBox from "./DialogueBox";

interface PropsNpcData {
    npcData: NPC[] | null;
    cameraPosition: { x: number; y: number };
    onDialogOpen?: (isOpen: boolean) => void;
}

// NPCの対話状態を管理する型
interface NpcDialogueState {
    [npcId: number]: {
        hasHeardDialogue: boolean;
        lastInteractionDate: string;
        y?: number
    };
}

// 現在のステージを定義（この変数がどこかで定義されている必要があります）
const currentStage = 1; // 仮の値、実際の値に置き換えてください

const NpcTest: React.FC<PropsNpcData> = ({
                                             npcData,
                                             cameraPosition,
                                             onDialogOpen,
                                         }) => {
    const [activeDialogue, setActiveDialogue] = useState<{
        isVisible: boolean;
        npc: NPC | null;
        currentIndex?: number;
    }>({
        isVisible: false,
        npc: null,
        currentIndex: 0,
    });

    // NPCの対話状態を管理するstate
    const [npcDialogueStates, setNpcDialogueStates] = useState<NpcDialogueState>(
        {}
    );
    console.log(npcDialogueStates)

    // ローカルストレージからNPCの対話状態を読み込む
    useEffect(() => {
        const savedStates = localStorage.getItem("npcDialogueStates");
        if (savedStates) {
            try {
                setNpcDialogueStates(JSON.parse(savedStates));
            } catch (e) {
                console.error("NPCの対話状態の読み込みに失敗しました:", e);
            }
        }
    }, []);

    // NPCの対話状態を保存する関数
    const saveNpcDialogueState = (npcId: number) => {
        const updatedStates = {
            ...npcDialogueStates,
            [npcId]: {
                hasHeardDialogue: true,
                lastInteractionDate: new Date().toISOString(),
            },
        };

        setNpcDialogueStates(updatedStates);
        localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
    };

    // NPCの対話状態をチェックする関数
    const hasHeardDialogue = (npcId: number): boolean => {
        return npcDialogueStates[npcId]?.hasHeardDialogue || false;
    };

    // --- 対話ボックスの状態管理 ---
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
            currentIndex: 0,
        });
    };

    // ダイアログを閉じる関数
    const closeDialogue = () => {
        setActiveDialogue({
            isVisible: false,
            npc: null,
        });
    };

    // ダイアログ自動進行用のタイマー参照
    const dialogueTimerRef = useRef<NodeJS.Timeout | null>(null);

    // NPCがクリックされたときに呼び出されるハンドラ
    const handleNpcClick = (clickedNpc: NPC, isAutomatic = false) => {
        if (dialogueTimerRef.current) {
            clearInterval(dialogueTimerRef.current);
            dialogueTimerRef.current = null;
        }

        const dialogues =
            typeof clickedNpc.dialogues === "string"
                ? JSON.parse(clickedNpc.dialogues)
                : clickedNpc.dialogues;

        const hasDialogue =
            dialogues && Array.isArray(dialogues) && dialogues.length > 0;

        if (activeDialogue.isVisible && activeDialogue.npc?.id === clickedNpc.id) {
            setActiveDialogue({isVisible: false, npc: null, currentIndex: 0});
        } else if (hasDialogue) {
            if (!isAutomatic || (isAutomatic && !hasHeardDialogue(clickedNpc.id))) {
                setActiveDialogue({isVisible: true, npc: clickedNpc, currentIndex: 0});

                if (clickedNpc.id === 1) {
                    dialogueTimerRef.current = setInterval(() => {
                        setActiveDialogue((prev) => {
                            const dialogArray =
                                typeof clickedNpc.dialogues === "string"
                                    ? JSON.parse(clickedNpc.dialogues)
                                    : clickedNpc.dialogues;

                            const nextIndex = prev.currentIndex + 1;

                            if (nextIndex >= dialogArray.length) {
                                if (dialogueTimerRef.current) {
                                    clearInterval(dialogueTimerRef.current);
                                    dialogueTimerRef.current = null;
                                }

                                if (isAutomatic) {
                                    saveNpcDialogueState(clickedNpc.id);
                                }

                                return prev;
                            }

                            return {
                                ...prev,
                                currentIndex: nextIndex,
                            };
                        });
                    }, 2500);
                }
            }
        } else {
            setActiveDialogue({isVisible: false, npc: null, currentIndex: 0});
        }
    };

    const handleCloseDialogue = () => {
        // ダイアログを閉じる前に、最後のダイアログだった場合の処理
        if (activeDialogue.npc && activeDialogue.isVisible) {
            const dialogues = typeof activeDialogue.npc.dialogues === 'string'
                ? JSON.parse(activeDialogue.npc.dialogues)
                : activeDialogue.npc.dialogues;

            const currentIndex = activeDialogue.currentIndex || 0;

            // 最後のダイアログだった場合
            if (dialogues && Array.isArray(dialogues) && currentIndex >= dialogues.length - 1) {
                // NPC IDが3の場合、移動処理を実行
                if (activeDialogue.npc.id === 3) {
                    console.log("最後のダイアログに到達しました - ダイアログ閉じる時");
                    setTimeout(() => {
                        const newY = (npcDialogueStates[activeDialogue.npc!.id]?.y || activeDialogue.npc!.y) + 64;

                        // 状態を更新
                        const updatedStates = {
                            ...npcDialogueStates,
                            [activeDialogue.npc!.id]: {
                                ...npcDialogueStates[activeDialogue.npc!.id],
                                hasHeardDialogue: true,
                                lastInteractionDate: new Date().toISOString(),
                                y: newY,
                            },
                        };

                        // 状態を設定してローカルストレージに保存
                        setNpcDialogueStates(updatedStates);
                        localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
                    }, 3000);
                }
            }
        }

        setActiveDialogue({
            isVisible: false,
            npc: null,
            currentIndex: 0,
        });

        if (dialogueTimerRef.current) {
            clearInterval(dialogueTimerRef.current);
            dialogueTimerRef.current = null;
        }
    };


    useEffect(() => {
        return () => {
            if (dialogueTimerRef.current) {
                clearInterval(dialogueTimerRef.current);
            }
        };
    }, []);

// 次のダイアログに進むハンドラ
    const handleNextDialogue = () => {
        // タイマーがある場合はクリア（自動進行を停止）
        if (dialogueTimerRef.current) {
            clearInterval(dialogueTimerRef.current);
            dialogueTimerRef.current = null;
        }

        setActiveDialogue(prev => {
            if (!prev.npc) return prev;

            const dialogues = typeof prev.npc.dialogues === 'string'
                ? JSON.parse(prev.npc.dialogues)
                : prev.npc.dialogues;

            const nextIndex = (prev.currentIndex || 0) + 1;

            if (!dialogues || dialogues.length === 0 || nextIndex >= dialogues.length) {
                // NPC IDが3の場合、ダイアログ終了後に3秒待機して下に1マス移動
                if (prev.npc.id === 3) {
                    console.log("最後のダイアログに到達しました");
                    setTimeout(() => {
                        const newY = (npcDialogueStates[prev.npc!.id]?.y || prev.npc!.y) + 64;

                        // 状態を更新
                        const updatedStates = {
                            ...npcDialogueStates,
                            [prev.npc!.id]: {
                                ...npcDialogueStates[prev.npc!.id],
                                hasHeardDialogue: true,
                                lastInteractionDate: new Date().toISOString(),
                                y: newY,
                            },
                        };

                        // 状態を設定してローカルストレージに保存
                        setNpcDialogueStates(updatedStates);
                        localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
                    }, 3000);
                }
                return prev;
            }
            return {
                ...prev,
                currentIndex: nextIndex
            };
        });
    };
// 前のダイアログに戻るハンドラ
    const handlePrevDialogue = () => {
        // タイマーがある場合はクリア（自動進行を停止）
        if (dialogueTimerRef.current) {
            clearInterval(dialogueTimerRef.current);
            dialogueTimerRef.current = null;
        }

        setActiveDialogue(prev => {
            if (!prev.npc) return prev;

            const prevIndex = (prev.currentIndex || 0) - 1;

            // 最初のダイアログより前には戻れない
            if (prevIndex < 0) {
                return prev;
            }

            return {
                ...prev,
                currentIndex: prevIndex
            };
        });
    };


    if (!npcData || npcData.length === 0) {
        return <div>NPCデータがありません</div>;
    }

    return (
        <>
            {npcData.map((npc) => (
                <SingleNpc
                    key={npc.id}
                    npc={npc}
                    cameraPosition={cameraPosition}
                    onNpcClick={(npc) => handleNpcClick(npc, false)}
                    hasHeardDialogue={hasHeardDialogue(npc.id)}
                    onAutoDialogue={(npc) => handleNpcClick(npc, true)}
                    npcState={npcDialogueStates[npc.id]} // 追加：NPCの状態を渡す
                />
            ))}

            <DialogueBox
                activeDialogue={{
                    isVisible: activeDialogue.isVisible,
                    npc: activeDialogue.npc,
                    currentIndex: activeDialogue.currentIndex,
                }}
                onClose={handleCloseDialogue}
                onNextDialogue={handleNextDialogue}
                onPrevDialogue={handlePrevDialogue}
            />
        </>
    );
};

interface PropsSingleNpc {
    npc: NPC;
    onNpcClick: (npc: NPC) => void;
    onAutoDialogue: (npc: NPC) => void;
    cameraPosition: { x: number; y: number };
    hasHeardDialogue: boolean;
    npcState?: { // 追加：NPCの状態
        hasHeardDialogue: boolean;
        lastInteractionDate: string;
        y?: number;
    };
}

const SingleNpc: React.FC<PropsSingleNpc> = ({
                                                 npc,
                                                 onNpcClick,
                                                 onAutoDialogue,
                                                 cameraPosition,
                                                 hasHeardDialogue,
                                                 npcState,
                                             }) => {
    const imageIndex = 1;
    const validImageIndex = npc.images.length > imageIndex ? imageIndex : 0;

    const [image] = useImage(npc.images[validImageIndex]);
　

    if (npc.stageStatus !== currentStage) {
        return null;
    }
    // npcStateのyがあればそれを使用、なければnpc.yを使用
    const [position, setPosition] = useState({
        x: npc.x,
        y: npcState?.y !== undefined ? npcState.y : npc.y
    });

    // npcStateが変更されたときに位置を更新するエフェクト
    useEffect(() => {
        if (npcState?.y !== undefined) {
            setPosition(prev => ({...prev, y: npcState.y}));
        }
    }, [npcState?.y]);

    useEffect(() => {
        let isMounted = true;

        if (npc.id === 1) {
            const moveToDestination = async () => {
                const targetX = 64;
                const targetY = 128;

                let currentX = npc.x;
                let currentY = npc.y;

                setPosition({x: currentX, y: currentY});

                while (currentX > targetX && isMounted) {
                    await new Promise((resolve) => setTimeout(resolve, 150));
                    currentX -= 64;
                    setPosition((prev) => ({x: currentX, y: prev.y}));
                }

                while (currentY > targetY && isMounted) {
                    await new Promise((resolve) => setTimeout(resolve, 150));
                    currentY -= 64;
                    setPosition((prev) => ({x: prev.x, y: currentY}));
                }

                if (isMounted && !hasHeardDialogue) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                    onAutoDialogue(npc);
                }
            };

            moveToDestination();
        }

        return () => {
            isMounted = false;
        };
    }, [hasHeardDialogue]);

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
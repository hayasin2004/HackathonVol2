"use client";
import React, {useEffect, useRef, useState} from "react";
import {NPC} from "@/types/npc";
import {Stage, Layer, Group, Image} from "react-konva";
import useImage from "use-image";
import DialogueBox from "./DialogueBox";
import firstQuest from "@/repository/prisma/quest/firstQuest/firstQuest";

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
        x?: number
        dialogueProgress?: number; // どこまでダイアログを表示したかを追跡
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
// NPCがクリックされたときに呼び出されるハンドラを修正
// NPCがクリックされたときに呼び出されるハンドラを修正
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
                // 3番NPCの特殊処理
                if (clickedNpc.id === 3) {
                    const npcState = npcDialogueStates[clickedNpc.id];
                    const targetX = 1024;
                    const targetY = 2176;

                    // 移動完了後かどうかを判断
                    const hasMoved = npcState?.x === targetX && npcState?.y === targetY;

                    // 初回は8個目まで、移動完了後は9個目以降を表示
                    let startIndex = 0;

                    if (hasMoved) {
                        // 移動完了後は9個目から表示
                        startIndex = 8;
                        console.log("ID=3のNPCが移動後にクリックされました。9番目以降のダイアログを表示します。");
                        console.log(`開始インデックス: ${startIndex}, 表示するダイアログ: ${dialogues[startIndex]}`);
                        const GetFirstQuest = async () => {
                            const response = await firstQuest()
                            console.log(response)
                        }
                        GetFirstQuest()

                        // 配列の範囲を超えないようにチェック
                        if (startIndex >= dialogues.length) {
                            console.log("開始インデックスがダイアログ配列の範囲を超えています。インデックス0から開始します。");
                            startIndex = 0;
                        }
                    } else {
                        console.log("ID=3のNPCが移動前にクリックされました。最初からのダイアログを表示します。");
                    }

                    setActiveDialogue({
                        isVisible: true,
                        npc: clickedNpc,
                        currentIndex: startIndex
                    });
                } else {
                    // 他のNPCは通常通り
                    setActiveDialogue({isVisible: true, npc: clickedNpc, currentIndex: 0});

                    // ID=1のNPCの自動進行コードを復元
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
            }
        } else {
            setActiveDialogue({isVisible: false, npc: null, currentIndex: 0});
        }
    };// ダイアログを閉じるハンドラも修正
    const handleCloseDialogue = () => {
        // ダイアログを閉じる前に、最後のダイアログだった場合の処理
        if (activeDialogue.npc && activeDialogue.isVisible) {
            const dialogues = typeof activeDialogue.npc.dialogues === 'string'
                ? JSON.parse(activeDialogue.npc.dialogues)
                : activeDialogue.npc.dialogues;

            const currentIndex = activeDialogue.currentIndex || 0;

            // 3番NPCの特殊処理
            if (activeDialogue.npc.id === 3) {
                const npcState = npcDialogueStates[activeDialogue.npc.id];
                const targetX = 1024;
                const targetY = 2176;
                const hasMoved = npcState?.x === targetX && npcState?.y === targetY;

                // 初回の対話で8個目まで表示した場合
                if (!hasMoved && currentIndex >= 7) {
                    console.log("最後のダイアログに到達しました - ダイアログ閉じる時");

                    // 状態を更新 - yだけ更新して移動をトリガー
                    const updatedStates = {
                        ...npcDialogueStates,
                        [activeDialogue.npc!.id]: {
                            ...npcDialogueStates[activeDialogue.npc!.id],
                            hasHeardDialogue: true,
                            lastInteractionDate: new Date().toISOString(),
                            y: activeDialogue.npc!.y + 1, // 少しだけ値を変えて移動をトリガー
                            dialogueProgress: 8, // 8個目まで表示したことを記録
                        },
                    };

                    // 状態を設定してローカルストレージに保存
                    setNpcDialogueStates(updatedStates);
                    localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
                }
            }
            // 他のNPCの処理（既存のコード）...
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

            // 3番NPCの特殊処理
            if (prev.npc.id === 3) {
                const npcState = npcDialogueStates[prev.npc.id];
                const targetX = 1024;
                const targetY = 2176;
                const hasMoved = npcState?.x === targetX && npcState?.y === targetY;

                // 初回は8個目まで
                if (!hasMoved && nextIndex >= 8) {
                    console.log("初回の対話は8個目まで。移動を開始します。");

                    // 状態を更新 - yだけ更新して移動をトリガー
                    const updatedStates = {
                        ...npcDialogueStates,
                        [prev.npc!.id]: {
                            ...npcDialogueStates[prev.npc!.id],
                            hasHeardDialogue: true,
                            lastInteractionDate: new Date().toISOString(),
                            y: prev.npc!.y + 1, // 少しだけ値を変えて移動をトリガー
                            dialogueProgress: 8, // 8個目まで表示したことを記録
                        },
                    };

                    // 状態を設定してローカルストレージに保存
                    setNpcDialogueStates(updatedStates);
                    localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));

                    // ダイアログを閉じる
                    return {
                        isVisible: false,
                        npc: null,
                        currentIndex: 0
                    };
                }

                // 移動完了後は9個目以降を表示
                if (hasMoved) {
                    console.log(`ID=3のNPC移動後、次のダイアログに進みます: ${nextIndex + 1}/12`);

                    // 最後のダイアログに達した場合
                    if (nextIndex >= dialogues.length) {
                        console.log("移動後の対話が終了しました");
                        return {
                            isVisible: false,
                            npc: null,
                            currentIndex: 0
                        };
                    }

                    console.log(`表示するダイアログ: ${dialogues[nextIndex]}`);
                }
            }

            // 通常の処理
            if (!dialogues || dialogues.length === 0 || nextIndex >= dialogues.length) {
                // NPC IDが3の場合の処理は上で行ったので、ここでは他のNPCのみ処理
                if (prev.npc.id !== 3) {
                    // NPC IDが1の場合の処理
                    if (prev.npc.id === 1) {
                        console.log("ID=1のNPCのダイアログが終了しました");

                        // 状態を更新
                        saveNpcDialogueState(prev.npc.id);
                    }
                }
                return {
                    isVisible: false,
                    npc: null,
                    currentIndex: 0
                };
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

            // 3番NPCの特殊処理
            if (prev.npc.id === 3) {
                const npcState = npcDialogueStates[prev.npc.id];
                const targetX = 1024;
                const targetY = 2176;
                const hasMoved = npcState?.x === targetX && npcState?.y === targetY;

                if (hasMoved) {
                    console.log(`ID=3のNPC移動後、前のダイアログに戻ります: ${prevIndex + 1}/12`);

                    // 移動後は9個目より前には戻れない
                    if (prevIndex < 8) {
                        console.log("移動後は9個目より前のダイアログには戻れません");
                        return prev;
                    }

                    const dialogues = typeof prev.npc.dialogues === 'string'
                        ? JSON.parse(prev.npc.dialogues)
                        : prev.npc.dialogues;
                    console.log(`表示するダイアログ: ${dialogues[prevIndex]}`);
                }
            }

            // 最初のダイアログより前には戻れない
            if (prevIndex < 0) {
                console.log("最初のダイアログより前には戻れません");
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
        x?: number;
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
    const moveInProgressRef = useRef(false);
　

    if (npc.stageStatus !== currentStage) {
        return null;
    }
// npcStateのx,yがあればそれを使用、なければnpc.x, npc.yを使用
    const [position, setPosition] = useState({
        x: npcState?.x !== undefined ? npcState.x : npc.x,
        y: npcState?.y !== undefined ? npcState.y : npc.y
    });

// npcStateが変更されたときに位置を更新するエフェクト
    useEffect(() => {
        if (npcState?.y !== undefined || npcState?.x !== undefined) {
            setPosition(prev => ({
                x: npcState?.x !== undefined ? npcState.x : prev.x,
                y: npcState?.y !== undefined ? npcState.y : prev.y
            }));
        }
    }, [npcState?.y, npcState?.x]);



    // 移動用の参照
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

        // ID=3のNPCの移動ロジック
// ID=3のNPCの移動ロジック部分を修正
        // ID=3のNPCの移動ロMジック - 移動が必要な場合のみ実行
        else if (npc.id === 3 && npcState?.y !== undefined && !moveInProgressRef.current) {
            const targetX = 1024;
            const targetY = 2176;

            // 既に目的地にいる場合は移動しない
            if (position.x === targetX && position.y === targetY) {
                console.log("既に目的地にいるため移動しません");
                return;
            }

            // npcStateに最終位置が保存されている場合は移動しない
            // 移動トリガーの場合のみ移動する（y値が少し変更された場合）
            if (npcState.x === targetX && npcState.y === targetY) {
                console.log("最終位置が保存されているため移動しません");
                setPosition({x: targetX, y: targetY});
                return;
            }

            // 移動が必要な場合のみ実行
            const moveToDestination = async () => {
                moveInProgressRef.current = true;

                let currentX = position.x;
                let currentY = position.y;

                // Y座標の移動
                while ((targetY > currentY ? currentY < targetY : currentY > targetY) && isMounted) {
                    await new Promise((resolve) => setTimeout(resolve, 90));
                    currentY += (targetY > currentY) ? 64 : -64;
                    setPosition((prev) => ({x: prev.x, y: currentY}));
                }

                // X座標の移動
                while ((targetX > currentX ? currentX < targetX : currentX > targetX) && isMounted) {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    currentX += (targetX > currentX) ? 64 : -64;
                    setPosition((prev) => ({x: currentX, y: prev.y}));
                }

                // 移動完了後、最終位置をローカルストレージに保存
                if (isMounted) {
                    const savedStates = localStorage.getItem("npcDialogueStates");
                    let updatedStates = {};

                    if (savedStates) {
                        try {
                            updatedStates = JSON.parse(savedStates);
                        } catch (e) {
                            console.error("NPCの対話状態の読み込みに失敗しました:", e);
                        }
                    }

                    // 最終位置を保存
                    updatedStates = {
                        ...updatedStates,
                        [npc.id]: {
                            ...(updatedStates[npc.id] || {}),
                            hasHeardDialogue: true,
                            lastInteractionDate: new Date().toISOString(),
                            y: targetY,
                            x: targetX,
                            dialogueProgress: updatedStates[npc.id]?.dialogueProgress || 8, // 既存の値を保持
                        },
                    };

                    // ローカルストレージに保存
                    localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
                    console.log("移動完了、位置を保存しました:", targetX, targetY);
                }

                moveInProgressRef.current = false;
            };

            moveToDestination();
        }
        return () => {
            isMounted = false;
        };
    }, [npcState?.y, npcState?.x, hasHeardDialogue]);

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
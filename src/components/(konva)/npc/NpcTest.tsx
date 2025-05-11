"use client";
import React, {useEffect, useRef, useState} from "react";
import {NPC} from "@/types/npc";
import {Stage, Layer, Group, Image, Text} from "react-konva";
import useImage from "use-image";
import DialogueBox from "./DialogueBox";
import firstQuest from "@/repository/prisma/quest/firstQuest/firstQuest";
import {PlayerItem} from "@/types/playerItem";
import {QuestType} from "@/types/quest";
import {number} from "prop-types";
import {toast} from "react-toastify";

interface PropsNpcData {
    npcData: NPC[] | null;
    cameraPosition: { x: number; y: number };
    onDialogOpen?: (isOpen: boolean) => void;
    player: PlayerItem
    onQuestTrigger?: (npcId: number, questId: number) => void; // 追加: クエスト受注通知用
    onAlert?: () => void; // 新たに追加
    activeQuest?: QuestType
    onNextQuest?: (currentQuestId: number) => void;


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
                                             player,
                                             onQuestTrigger,
                                             onAlert,
                                             activeQuest,
                                             onNextQuest
                                         }) => {

    //console.log(player)
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
    const [questProgress, setQuestProgress] = useState(0);
    console.log(questProgress)
    const [firstSakuraTalk, setFirstSakuraTalk] = useState(false);
    useEffect(() => {

        // クエストIDが2の場合にアラートを表示
        if (activeQuest?.quest.id === 2) {
            setQuestProgress(2)
        } else if (activeQuest?.quest.id == 4) {
            //alert("これ4つ目")
            setQuestProgress(4)
        }
    }, [activeQuest]);


    //console.log(npcDialogueStates)

    // ローカルストレージからNPCの対話状態を読み込む
    useEffect(() => {
        const savedStates = localStorage.getItem("npcDialogueStates");
        if (savedStates) {
            try {
                const parsedStates = JSON.parse(savedStates); // JSONをパース
                const npcState = parsedStates["1"]; // NPC IDが1のデータを取得
                if (npcState?.message === "サクラ一回しゃべった") {
                    setQuestProgress(1)
                    //alert("pasokongagenkai")
                }
                setNpcDialogueStates(JSON.parse(savedStates));
            } catch (err) {
                console.log(err)
                //console.error("NPCの対話状態の読み込みに失敗しました:", e);
            }
        }
        const questCurrent = localStorage.getItem("enemyPositions");
        const quest4Sakura = localStorage.getItem("quest3Complete");
        const sakuraFirstContact = localStorage.getItem("npcDialogueStates")
        if (
            (sakuraFirstContact && (quest4Sakura === undefined || quest4Sakura === null)) &&
            (questCurrent === undefined || questCurrent === null)
        ) {
            // //alert("あ");
            setFirstSakuraTalk(true);
            return;
        } else if (questCurrent && quest4Sakura == undefined || quest4Sakura == null) {
            const parsedData = JSON.parse(questCurrent); // JSONをパース
            if (parsedData) {

                const npc3Data = parsedData["10"]; // NPC IDが3のデータを取得

                if (npc3Data?.progress === "みどりと話そう") {
                    setQuestProgress(1);
                    // kaiha 16 start
                    //console.log("話しましょう");
                }
            }
        } else if (questCurrent && quest4Sakura) {
            // JSONをパース

            if (quest4Sakura === "サクラと話そう") {
                setQuestProgress(4);
                // kaiha 16 start
                //console.log("話しましょう");
            }
        }


    }, []);


    // NPCの対話状態を保存する関数
    const saveNpcDialogueState = (npcId: number, message?: string) => {
        const updatedStates = {
            ...npcDialogueStates,
            [npcId]: {
                hasHeardDialogue: true,
                lastInteractionDate: new Date().toISOString(),
                message: message || ""
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

    const questProgressRef = useRef(questProgress);
    console.log(questProgressRef.current)
// questProgressを更新するたびに参照を更新
    useEffect(() => {
        questProgressRef.current = questProgress;
    }, [questProgress, questProgressRef]);

// 最新の値を使用する
    const handleNpcClick = (clickedNpc: NPC, isAutomatic = false) => {
        if (dialogueTimerRef.current) {
            clearInterval(dialogueTimerRef.current);
            dialogueTimerRef.current = null;
        }

        // ここでしゃべらせてたのむから！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！うｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐｐ
        if (clickedNpc.id === 1 && questProgressRef.current == 0) {

            //alert("questProgress" + questProgressRef.current)


            if (!isAutomatic || (isAutomatic && !hasHeardDialogue(clickedNpc.id))) {
                dialogueTimerRef.current = setInterval(() => {
                    setActiveDialogue((prev) => {
                        // ダイアログの配列を取得
                        let dialogArray: string[] = [];
                        if (typeof clickedNpc.dialogues === "string") {
                            try {
                                dialogArray = JSON.parse(clickedNpc.dialogues).slice(0, 8); // 最初の8個を取得

                                //alert(dialogArray)
                            } catch (error) {
                                //console.error("ダイアログのパースに失敗しました:", error);
                                return prev; // パースエラーの場合は何もしない
                            }
                        } else if (Array.isArray(clickedNpc.dialogues)) {
                            dialogArray = clickedNpc.dialogues.slice(0, 8); // 最初の8個を取得
                        } else {
                            //console.error("ダイアログの形式が不正です:", clickedNpc.dialogues);
                            return prev; // 不正な形式の場合は何もしない
                        }

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
                                toast.info("みどりに話しかけよう")
                                saveNpcDialogueState(clickedNpc.id, "サクラ一回しゃべった");
                            }

                            return {
                                ...prev,
                                isVisible: false, // ダイアログを非表示に設定
                            };
                        }

                        // 次のダイアログを表示
                        return {
                            ...prev,
                            currentIndex: nextIndex,
                            npc: {
                                ...prev.npc,
                                dialogues: dialogArray, // スライスされたダイアログを使用
                            },
                        };
                    });
                }, 2500)
            }


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
                // 3番NPCの特
                let startIndex = 0; // デフォルトは最初のダイアログ　
                let filteredDialogues = dialogues; // 初期値は全体のダイアログ配列
                if (!isAutomatic || (isAutomatic && !hasHeardDialogue(clickedNpc.id))) {
                    setActiveDialogue({isVisible: true, npc: clickedNpc, currentIndex: 0});

                    //console.log("クリックしたときの", questProgress !== 4, clickedNpc.id === 1, firstSakuraTalk)
                    // ID=1のNPCの場合、自動的にダイアログを進行


                    if (questProgress !== 4 && clickedNpc.id === 1 && firstSakuraTalk) {
                        // 2秒ごとにダイアログを進行するタイマーを設定


// 2秒ごとにダイアログを進行するタイマーを設定
                        dialogueTimerRef.current = setInterval(() => {
                            setActiveDialogue((prev) => {
                                // ダイアログの配列を取得
                                let dialogArray: string[] = [];
                                if (typeof clickedNpc.dialogues === "string") {
                                    try {

                                        dialogArray = JSON.parse(clickedNpc.dialogues).slice(0, 8); // 最初の8個を取得

                                    } catch (error) {
                                        //console.error("ダイアログのパースに失敗しました:", error);
                                        return prev; // パースエラーの場合は何もしない
                                    }
                                } else if (Array.isArray(clickedNpc.dialogues)) {
                                    dialogArray = clickedNpc.dialogues.slice(0, 8); // 最初の8個を取得
                                } else {
                                    //console.error("ダイアログの形式が不正です:", clickedNpc.dialogues);
                                    return prev; // 不正な形式の場合は何もしない
                                }

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
                                        toast.info("みどりに話しかけよう")
                                        saveNpcDialogueState(clickedNpc.id);
                                    }

                                    return {
                                        ...prev,
                                        isVisible: false, // ダイアログを非表示に設定
                                    };
                                }

                                // 次のダイアログを表示
                                return {
                                    ...prev,
                                    currentIndex: nextIndex,
                                    npc: {
                                        ...prev.npc,
                                        dialogues: dialogArray, // スライスされたダイアログを使用
                                    },
                                };
                            });
                        }, 2500); // 2.5秒ごと; // 2秒ごと
                    }
                    //     すでにサクラとの自動会話を終わらせたときにクリックしたとき
                    else if (questProgress !== 4 && clickedNpc.id === 1 && firstSakuraTalk) {
                        // 自動スクロール機能を削除し、ダイアログを取得して表示するだけに変更
                        let dialogArray: string[] = [];
                        if (typeof clickedNpc.dialogues === "string") {
                            try {
                                dialogArray = JSON.parse(clickedNpc.dialogues).slice(0, 8); // 最初の8個を取得
                            } catch (error) {
                                //console.error("ダイアログのパースに失敗しました:", error);
                                return; // パースエラーの場合は処理を終了
                            }
                        } else if (Array.isArray(clickedNpc.dialogues)) {
                            dialogArray = clickedNpc.dialogues.slice(0, 8); // 最初の8個を取得
                        } else {
                            //console.error("ダイアログの形式が不正です:", clickedNpc.dialogues);
                            return; // 不正な形式の場合は処理を終了
                        }

                        // ダイアログを表示
                        setActiveDialogue({
                            isVisible: true,
                            npc: {
                                ...clickedNpc,
                                dialogues: dialogArray, // スライスされたダイアログを設定
                            },
                            currentIndex: 0, // 最初のダイアログから開始
                        });
                    }
                }


                if (questProgress === 4 && clickedNpc.id === 1) {
                    // questProgressが4でNPC IDが1の場合、10番目のダイアログを表示
                    startIndex = 0; // 0ベースで10番目
                    //console.log("questProgressが4でNPC IDが1です。10番目のダイアログを表示します。");

                    // ダイアログをフィルタリング
                    const filteredDialogues = dialogues.slice(9); // 最初の10個を取得
                    setActiveDialogue({
                        isVisible: true,
                        npc: {
                            ...clickedNpc,
                            dialogues: filteredDialogues, // フィルタリングしたダイアログを設定
                        },
                        currentIndex: startIndex, // 10番目（0ベースで9）から開始
                    });
                    return; // 他の処理をスキップ
                } else if (clickedNpc.id === 3) {

                    const npcState = npcDialogueStates[clickedNpc.id];
                    const targetX = 1024;
                    const targetY = 2176;

                    // 移動完了後かどうかを判断
                    const hasMoved = npcState?.x === targetX && npcState?.y === targetY;
                    // 初回は8個目まで、移動完了後は9個目以降を表示
                    let startIndex = 0;

                    if (questProgress == 1 && clickedNpc.id === 3) {
                        // ダイアログを8番目から17番目まで取得
                        filteredDialogues = dialogues.slice(8, 15); // 8番目から17番目（0-based index）を取得
                        startIndex = 0; // スライス後の配列の最初から開始
                        //console.log("ID=3のNPCが移動後にクリックされました。8番目から17番目までのダイアログを表示します。");
                        //console.log(`開始インデックス: ${startIndex}, 表示するダイアログ: ${filteredDialogues[startIndex]}`);

                        if (onQuestTrigger) {
                            // 第一引数: NPCのID、第二引数: クエストのID (ここでは1と仮定)
                            onQuestTrigger(clickedNpc.id, 1);
                        }

                        // 配列の範囲を超えないようにチェック
                        if (startIndex >= filteredDialogues.length) {
                            //console.log("開始インデックスがダイアログ配列の範囲を超えています。インデックス0から開始します。");
                            startIndex = 0;
                        }

                        // スライスされたダイアログを設定
                        setActiveDialogue({
                            isVisible: true,
                            npc: {
                                ...clickedNpc,
                                dialogues: filteredDialogues, // スライスされたダイアログを使用
                            },
                            currentIndex: startIndex,
                        });
                    } else if (questProgress !== 2 && clickedNpc.id === 3) {
                        // questProgressが2の場合、15個目以降のダイアログのみを表示
                        filteredDialogues = dialogues.slice(0, 8); // 15個目以降を取得 (0-based index)
                        startIndex = 0; // スライス後の配列なので最初の要素から開始
                        //console.log("0~8個目のダイアログを1ページ目として表示します。");


                    } else if (questProgress === 2) {
                        // questProgressが2の場合、15個目以降のダイアログのみを表示
                        filteredDialogues = dialogues.slice(15); // 15個目以降を取得 (0-based index)
                        startIndex = 0; // スライス後の配列なので最初の要素から開始
                        //console.log("questProgressが2のため、15個目以降のダイアログを1ページ目として表示します。");
                    }

                    setActiveDialogue({
                        isVisible: true,
                        npc: {
                            ...clickedNpc,
                            dialogues: filteredDialogues, // フィルタリングしたダイアログを設定
                        },
                        currentIndex: startIndex,
                    });
                }
            }
        } else {
            setActiveDialogue({isVisible: false, npc: null, currentIndex: 0});
        }
    };// ダイアログを閉じるハンドラも修正
// ダイアログを閉じるハンドラ（修正）
    const handleCloseDialogue = () => {
        if (activeDialogue.npc && activeDialogue.isVisible) {
            const dialogues = typeof activeDialogue.npc.dialogues === 'string'
                ? JSON.parse(activeDialogue.npc.dialogues)
                : activeDialogue.npc.dialogues;

            const currentIndex = activeDialogue.currentIndex || 0;

            // 最後のダイアログだった場合
            if (dialogues && Array.isArray(dialogues) && currentIndex >= dialogues.length - 1) {
                // NPC IDが3の場合、移動処理を実行

                // NPC IDが1の場合にアラートを表示
                if (activeDialogue.npc.id === 1 && questProgress === 4) {
                    onNextQuest(4); // 現在のクエストIDを渡す
                    localStorage.setItem("quest4Complete", "にげて。。。早く。。。");

                    // NPCを指定の位置に移動
                    const targetX = 1024;
                    const targetY = 640;

                    setNpcDialogueStates((prev) => {
                        const updatedStates = {
                            ...prev,
                            [1]: {
                                ...(prev[1] || {}),
                                x: targetX,
                                y: targetY,
                            },
                        };

                        // ローカルストレージに保存
                        localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
                        return updatedStates;
                    });

                    //console.log(`NPC ID 1 を位置 (${targetX}, ${targetY}) に移動しました。`);
                }
                if (dialogues && Array.isArray(dialogues) && currentIndex >= dialogues.length - 1) {
                    // NPC IDが3の場合、移動処理を実行　

                    if (activeDialogue.npc.id === 3 && questProgress == 0) {

                        //console.log("最後のダイアログに到達しました - ダイアログ閉じる時");
                        setQuestProgress(2)
                        const targetX = 1024;
                        const targetY = 2176;
                        // 状態を更新 - yだけ更新して移動をトリガー
                        const updatedStates = {
                            ...npcDialogueStates,
                            [activeDialogue.npc!.id]: {
                                ...npcDialogueStates[activeDialogue.npc!.id],
                                hasHeardDialogue: true,
                                lastInteractionDate: new Date().toISOString(),
                                x: targetX,
                                y: targetY,
                                progress: "みどりと話そう"
                            },
                        };
                        // 状態を設定してローカルストレージに保存
                        setNpcDialogueStates(updatedStates);
                        localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
                        toast.info("みどりが走り出した！！追いかけよう！", {
                            autoClose: 5000, // 3秒後に自動で閉じる
                            onClose: () => {
                                // トーストが閉じた後にリロードを実行
                                window.location.reload();
                            }
                        })
                    } else if (activeDialogue.npc.id === 3 && questProgress == 1) {

                        const targetX = 1024;
                        const targetY = 2176;
                        const updatedStates = {
                            ...npcDialogueStates,
                            [activeDialogue.npc!.id]: {
                                ...npcDialogueStates[activeDialogue.npc!.id],
                                hasHeardDialogue: true,
                                lastInteractionDate: new Date().toISOString(),
                                x: targetX,
                                y: targetY,
                                dialogueProgress: 8, // 8個目まで表示したことを記録
                                progress: "Aiと話そう" // 状態を更新
                            },
                        };
                        setNpcDialogueStates(updatedStates);
                        localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
                        onAlert?.()


                    }
                }


                if (activeDialogue.npc.id === 3) {
                    //console.log("最後のダイアログに到達しました - NPCを移動させます");

                    const moveNpc = async () => {
                        const targetY = (npcDialogueStates[3]?.y || activeDialogue.npc?.y || 0) + 20 * 64; // 20マス分下に移動
                        let currentY = npcDialogueStates[3]?.y || activeDialogue.npc?.y || 0;

                        while (currentY < targetY) {
                            await new Promise((resolve) => setTimeout(resolve, 100)); // 100msごとに移動
                            currentY += 64; // 1マス分移動
                            setNpcDialogueStates((prev) => ({
                                ...prev,
                                [3]: {
                                    ...prev[3],
                                    y: currentY,
                                },
                            }));
                        }

                        // 移動完了後、NPCを非表示にし、ローカルストレージに保存
                        setNpcDialogueStates((prev) => {
                            const updatedStates = {
                                ...prev,
                                [3]: {
                                    ...prev[3],
                                    isVisible: false, // NPCを非表示にするフラグ
                                },
                            };

                            // ローカルストレージに保存
                            localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
                            return updatedStates;
                        });

                        //console.log("NPCが移動完了し、非表示になりました");
                    };

                    moveNpc();
                }
            }
        }

        // ダイアログを閉じる処理
        setActiveDialogue({
            isVisible: false,
            npc: null,
            currentIndex: 0,
        });

        if (dialogueTimerRef.current) {
            clearInterval(dialogueTimerRef.current);
            dialogueTimerRef.current = null;
        }

        // クエスト進行の更新
        if (questProgress === 2 && activeDialogue.npc?.id === 3) {
            const updatedEnemies = "みどりと会話が終わった。";
            localStorage.setItem("MidoriTold", JSON.stringify(updatedEnemies));

            if (onNextQuest) {
                setQuestProgress(0);
                onNextQuest(2); // 現在のクエストIDを渡す
            }
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

            // 3番NPCの特殊処理
            // if (prev.npc.id === 3) {
            //     const npcState = npcDialogueStates[prev.npc.id];
            //     const targetX = 1024;
            //     const targetY = 2176;
            //     const hasMoved = npcState?.x === targetX && npcState?.y === targetY;
            //
            //     // 初回は8個目まで
            //     if (!hasMoved && nextIndex >= 8) {
            //         //console.log("初回の対話は8個目まで。移動を開始します。");
            //
            //         // 状態を更新 - yだけ更新して移動をトリガー
            //         const updatedStates = {
            //             ...npcDialogueStates,
            //             [prev.npc!.id]: {
            //                 ...npcDialogueStates[prev.npc!.id],
            //                 hasHeardDialogue: true,
            //                 lastInteractionDate: new Date().toISOString(),
            //                 y: prev.npc!.y + 1, // 少しだけ値を変えて移動をトリガー
            //                 dialogueProgress: 8, // 8個目まで表示したことを記録
            //             },
            //         };
            //
            //         // 状態を設定してローカルストレージに保存
            //         setNpcDialogueStates(updatedStates);
            //         localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
            //
            //         // ダイアログを閉じる
            //         return {
            //             isVisible: false,
            //             npc: null,
            //             currentIndex: 0
            //         };
            //     }
            //
            //     // 移動完了後は9個目以降を表示
            //     if (hasMoved) {
            //         //console.log(`ID=3のNPC移動後、次のダイアログに進みます: ${nextIndex + 1}/12`);
            //
            //         // 最後のダイアログに達した場合
            //         if (nextIndex >= dialogues.length) {
            //             //console.log("移動後の対話が終了しました");
            //             return {
            //                 isVisible: false,
            //                 npc: null,
            //                 currentIndex: 0
            //             };
            //         }
            //
            //         //console.log(`表示するダイアログ: ${dialogues[nextIndex]}`);
            //     }
            // }

            // 通常の処理
            if (!dialogues || dialogues.length === 0 || nextIndex >= dialogues.length) {
                // NPC IDが3の場合の処理は上で行ったので、ここでは他のNPCのみ処理
                if (prev.npc.id !== 3) {
                    // NPC IDが1の場合の処理
                    if (prev.npc.id === 1) {
                        //console.log("ID=1のNPCのダイアログが終了しました");

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
            if (prev.npc.id === 3 && questProgress == 1) {
                // alert("kk")
                const npcState = npcDialogueStates[prev.npc.id];
                const targetX = 1024;
                const targetY = 2176;
                const hasMoved = npcState?.x === targetX && npcState?.y === targetY;

                if (hasMoved) {
                    //console.log(`ID=3のNPC移動後、前のダイアログに戻ります: ${prevIndex + 1}/12`);

                    // 移動後は9個目より前には戻れない
                    if (prevIndex < 8) {
                        //console.log("移動後は9個目より前のダイアログには戻れません");
                        return prev;
                    }

                    const dialogues = typeof prev.npc.dialogues === 'string'
                        ? JSON.parse(prev.npc.dialogues)
                        : prev.npc.dialogues;
                    //console.log(`表示するダイアログ: ${dialogues[prevIndex]}`);
                }
            }

            // 最初のダイアログより前には戻れない
            if (prevIndex < 0) {
                //console.log("最初のダイアログより前には戻れません");
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
                    isHighlighted={questProgress === 2 && npc.id === 3} // 強調条件を追加
                    questProgress={questProgress}
                    firstSakuraTalk={firstSakuraTalk}
                    questProgressRef={questProgressRef}
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
                questProgress={questProgress}
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
    isHighlighted?: boolean;
    questProgress: number
    firstSakuraTalk: boolean
    questProgressRef: React.MutableRefObject<number>; // 型指定を追加
}

const SingleNpc: React.FC<PropsSingleNpc> = ({
                                                 npc,
                                                 onNpcClick,
                                                 onAutoDialogue,
                                                 cameraPosition,
                                                 hasHeardDialogue,
                                                 npcState,
                                                 isHighlighted,
                                                 questProgress,
                                                 firstSakuraTalk,
                                                 questProgressRef
                                             }) => {
    const imageIndex = 1;
    const validImageIndex = npc.images.length > imageIndex ? imageIndex : 0;

    const [image] = useImage(npc.images[validImageIndex]);
    const moveInProgressRef = useRef(false);
    const isMountedRef = useRef(true);

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

    useEffect(() => {
        if (npc.id === 3 && questProgress === 1) {
            // 指定された座標にレンダリング
            const targetX = 1024;
            const targetY = 2176;

            setPosition({x: targetX, y: targetY});

            //console.log(`NPC ID 3 を座標 (${targetX}, ${targetY}) にレンダリングしました`);
        }
    }, [npc.id, questProgress])
    // 移動用の参照

// questProgressを更新するたびに参照を更新
    useEffect(() => {
        questProgressRef.current = questProgress;
    }, [questProgress]);


    useEffect(() => {
        isMountedRef.current = true; // 初期状態を true に設定
        let isMounted = true;

        // ローカルストレージに `quest4Complete` が存在する場合は停止
        const quest4Complete = localStorage.getItem("quest4Complete");
        if (quest4Complete) {
            if (npc.id === 1) {
                setPosition({x: 1024, y: 512}); // NPC を指定の位置に移動
                isMountedRef.current = false; // 移動を停止
                return; // これ以上の処理をスキップ
            }
            isMountedRef.current = false;
        }
        ;

        if (npc.id === 1 && questProgressRef !== 0) {
            //alert(111222);
            const moveToDestination = async () => {
                const targetX = 64;
                const targetY = 128;

                let currentX = npc.x;
                let currentY = npc.y;

                setPosition({x: currentX, y: currentY});

                while (currentX > targetX && isMountedRef.current) {
                    await new Promise((resolve) => setTimeout(resolve, 150));
                    currentX -= 64;
                    setPosition((prev) => ({x: currentX, y: prev.y}));

                    // ローカルストレージを再確認してループを停止
                    if (!isMountedRef.current) {
                        //console.log("移動処理が中断されました (X軸)。");
                        return;
                    }
                }

                while (currentY > targetY && isMountedRef.current) {
                    await new Promise((resolve) => setTimeout(resolve, 150));
                    currentY -= 64;
                    setPosition((prev) => ({x: prev.x, y: currentY}));

                    // ローカルストレージを再確認してループを停止
                    if (!isMountedRef.current) {
                        //console.log("移動処理が中断されました (Y軸)。");
                        return;
                    }
                }

                if (isMountedRef.current && !hasHeardDialogue) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                    // ダイアログを出す処理を無効化
                    // onAutoDialogue(npc);
                }
            };

            moveToDestination();
        } else if (npc.id === 3 && npcState?.y !== undefined && !moveInProgressRef.current && questProgress == 1) {
            const moveToDestination = async () => {
                moveInProgressRef.current = true;

                const targetX = 1024;
                const targetY = 2176;

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
                            //console.error("NPCの対話状態の読み込みに失敗しました:", e);
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
                            x: targetX, // X座標も保存しておく
                        },
                    };

                    // ローカルストレージに保存
                    localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
                    //console.log("移動完了、位置を保存しました:", targetX, targetY);
                }

                moveInProgressRef.current = false;
            };

            moveToDestination();
        }        //console.log(questProgressRef)
        if (npc.id === 1 && questProgressRef.current == 0) {
            const moveToDestination = async () => {
                const targetX = 64;
                const targetY = 128;

                let currentX = npc.x;
                let currentY = npc.y;

                setPosition({x: currentX, y: currentY});

                while (currentX > targetX && isMountedRef.current) {
                    await new Promise((resolve) => setTimeout(resolve, 150));
                    currentX -= 64;
                    setPosition((prev) => ({x: currentX, y: prev.y}));

                    // ローカルストレージを再確認してループを停止
                    if (!isMountedRef.current) {
                        //console.log("移動処理が中断されました (X軸)。");
                        return;
                    }
                }

                while (currentY > targetY && isMountedRef.current) {
                    await new Promise((resolve) => setTimeout(resolve, 150));
                    currentY -= 64;
                    setPosition((prev) => ({x: prev.x, y: currentY}));

                    // ローカルストレージを再確認してループを停止
                    if (!isMountedRef.current) {
                        //console.log("移動処理が中断されました (Y軸)。");
                        return;
                    }
                }

                if (isMountedRef.current && !hasHeardDialogue && questProgressRef.current == 0) {
                    // //alert("これ!" + questProgress);
                    await new Promise((resolve) => setTimeout(resolve, 300));
                    onAutoDialogue(npc);
                }
            };
            moveToDestination();


        } else if (npc.id === 3 && npcState?.y !== undefined && !moveInProgressRef.current && questProgress == 0) {
            // alert(questProgress)
            if (moveInProgressRef.current) return;
            const moveToDestination = async () => {
                moveInProgressRef.current = true;

                const targetX = 102;
                const targetY = 2176;

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
                            //console.error("NPCの対話状態の読み込みに失敗しました:", e);
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
                            x: targetX, // X座標も保存しておく
                        },
                    };

                    // ローカルストレージに保存
                    localStorage.setItem("npcDialogueStates", JSON.stringify(updatedStates));
                    //console.log("移動完了、位置を保存しました:", targetX, targetY);
                }

                moveInProgressRef.current = false;
            };

            moveToDestination();

        }


        return () => {
            isMountedRef.current = false;
        };
    }, [npcState?.y, npcState?.x, hasHeardDialogue, questProgress]);

    const handleClick = () => {
        onNpcClick(npc);
    };
    // if (npcState && npcState.isVisible === false) {
    //     return null; // NPCが非表示の場合、描画しない
    // }

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
            <Text
                text={npc.name}
                y={-20}
                fontSize={17}
                fill="#fff"
                align="center"
                width={64}
            />
            {image && (
                <Image
                    image={image}
                    width={64}
                    height={64}
                    listening={true}
                    hitStrokeWidth={0}
                    shadowColor={isHighlighted ? "yellow" : "black"} // 強調表示の場合は黄色の影
                    shadowBlur={isHighlighted ? 15 : 5} // 強調表示の場合は影を大きく
                    shadowOpacity={isHighlighted ? 0.8 : 0.5} // 強調表示の場合は影を強調
                />
            )}
        </Group>
    );
};


export default NpcTest;
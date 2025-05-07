"use client"
import React, { useState } from 'react';
import { NPC } from "@/types/npc";
import { Stage, Layer, Group, Image } from "react-konva";
import useImage from "use-image";
import DialogueBox from "@/components/(konva)/npc/DialogueBox"; // 対話ボックスコンポーネントをインポート
import { randomDialoguePool, DialogueEntry } from '@/data/dialogues'; // ランダム対話データをインポート

interface PropsNpcData {
    npcData: NPC[] | null
}

// 現在のステージを定義（実際の値に置き換えてください）
const currentStage = 1;

// onInteract関数（必要に応じて残すか削除）
const onInteract = (npc: NPC, dialogue: any) => {
    console.log("対話開始 (onInteract):", npc.name, dialogue);
};

const NpcTest: React.FC<PropsNpcData> = ({ npcData }) => {
    console.log(npcData);

    // --- 対話ボックスの状態管理 ---
    // isVisible: 対話ボックスが表示されているか
    // npc: 現在対話しているNPCのデータ (名前やポートレート用)
    // dialogueEntry: ランダムに選択され、現在表示中の対話エントリー
    // currentLineIndex: 現在表示している対話エントリー内の行インデックス
    const [activeDialogue, setActiveDialogue] = useState<{
        isVisible: boolean;
        npc: NPC | null;
        dialogueEntry: DialogueEntry | null;
        currentLineIndex: number;
    }>({ isVisible: false, npc: null, dialogueEntry: null, currentLineIndex: 0 });
    // --- ここまで ---

    // NPCがクリックされたときに呼び出されるハンドラ
    const handleNpcClick = (clickedNpc: NPC) => {
        // 現在対話中のNPCを再度クリックした場合は、対話ボックスを非表示にする
        if (activeDialogue.isVisible && activeDialogue.npc?.id === clickedNpc.id) {
             setActiveDialogue({ isVisible: false, npc: null, dialogueEntry: null, currentLineIndex: 0 });
        } else {
             // 対話ボックスが非表示の場合、または別のNPCをクリックした場合

             // ランダム対話プールに対話が存在するかチェック
             if (randomDialoguePool.length > 0) {
                 // プール全体からランダムに一つの対話エントリーを選択
                 const randomIndex = Math.floor(Math.random() * randomDialoguePool.length);
                 const randomEntry = randomDialoguePool[randomIndex];

                 // 選択された対話エントリーが有効で、かつ少なくとも1行あるか確認
                 if (randomEntry && randomEntry.lines.length > 0) {
                     // 対話ボックスを表示状態にし、選択されたランダム対話と最初の行を設定
                     setActiveDialogue({
                         isVisible: true,
                         npc: clickedNpc, // クリックされたNPCのデータは名前やポートレート表示のために保持
                         dialogueEntry: randomEntry, // 選択された対話エントリーを保持
                         currentLineIndex: 0 // 最初の行から開始
                     });
                     // 必要であれば、onInteract関数をここで呼び出す (例: randomEntry.lines[0])
                     // onInteract(clickedNpc, randomEntry.lines[0]);
                 } else {
                      // ランダム選択されたエントリーに問題がある場合
                      console.error("ランダム選択された対話エントリーが無効です:", randomEntry);
                      setActiveDialogue({ isVisible: false, npc: null, dialogueEntry: null, currentLineIndex: 0 });
                 }

             } else {
                  // ランダム対話プールが空の場合
                  console.warn("ランダム対話プールが空です。");
                  setActiveDialogue({ isVisible: false, npc: null, dialogueEntry: null, currentLineIndex: 0 });
             }
        }
    };

    // 対話ボックスがクリックされたときに呼び出され、対話を次の行に進めるか終了する関数
    const handleDialogueAdvance = () => {
        // 対話ボックスが表示中でない、または必要なデータがない場合は何もしない
        if (!activeDialogue.isVisible || !activeDialogue.dialogueEntry) {
            return;
        }

        const { dialogueEntry, currentLineIndex } = activeDialogue;
        const lines = dialogueEntry.lines; // 現在の対話エントリーの行リスト

        // 行データが有効かチェック
        if (!lines || !Array.isArray(lines)) {
             console.error("無効な対話エントリーの行データ:", dialogueEntry);
             setActiveDialogue({ isVisible: false, npc: null, dialogueEntry: null, currentLineIndex: 0 }); // エラー時は非表示
             return;
        }

        if (currentLineIndex < lines.length - 1) {
            // 現在の行が最後でなければ、次の行に進める
            setActiveDialogue({
                ...activeDialogue,
                currentLineIndex: currentLineIndex + 1
            });
        } else {
            // 現在の行が最後であれば、対話を終了し、stateをリセット
            setActiveDialogue({ isVisible: false, npc: null, dialogueEntry: null, currentLineIndex: 0 });
        }
    };


    if (!npcData || npcData.length === 0) {
        return <div>NPCデータがありません</div>;
    }

    return (
        <Stage
            width={typeof window !== "undefined" ? window.innerWidth : 0}
            height={typeof window !== "undefined" ? window.innerHeight : 0}
        >
            <Layer>
                {/* すべてのNPCを描画 */}
                {npcData.map((npc) => (
                    <SingleNpc
                        key={npc.id}
                        npc={npc}
                        onNpcClick={handleNpcClick} // クリックハンドラを渡す
                    />
                ))}

                {/* 対話ボックスを描画 */}
                <DialogueBox
                    activeDialogue={activeDialogue} // 対話の状態を渡す
                    onDialogueAdvance={handleDialogueAdvance} // 対話を進める関数を渡す
                />
            </Layer>
        </Stage>
    );
};

// Single NPC コンポーネント（変更なし）
interface PropsSingleNpc {
    npc: NPC;
    onNpcClick: (npc: NPC) => void;
}

const SingleNpc: React.FC<PropsSingleNpc> = ({ npc, onNpcClick }) => {
    // マップ上のスプライト画像は imageIndex = 1 を使用（元のコードから変更なし）
    const imageIndex = 1;
    const validImageIndex = npc.images.length > imageIndex ? imageIndex : 0;
    const [image] = useImage(npc.images[validImageIndex]);

    // 現在のステージにいないNPCは描画しない
    if (npc.stageStatus !== currentStage) {
        return null;
    }

    const handleClick = () => {
        // クリック時に親のハンドラを呼び出し、このNPCデータを渡す
        onNpcClick(npc);
    };

    return (
        <Group
            x={npc.x}
            y={npc.y}
            // Group 自体のクリック/タップイベントを設定
            onClick={handleClick}
            onTap={handleClick}
        >
            {/* NPC画像 (マップ上のスプライト) */}
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
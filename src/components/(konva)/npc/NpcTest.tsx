"use client"
import React, {useEffect, useRef, useState} from 'react';
import {NPC} from "@/types/npc";
import {Stage, Layer, Group, Image, Text} from "react-konva";
import useImage from "use-image";
import DialogueBox from './DialogueBox'; // DialogueBoxコンポーネントをインポート

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

    // --- 対話ボックスの状態管理 ---
    // isVisible: 対話ボックスが表示されているか
    // npc: 現在対話しているNPCのデータ (nullの場合は表示しない)
    const [activeDialogue, setActiveDialogue] = useState<{ isVisible: boolean, npc: NPC | null }>({
        isVisible: false,
        npc: null
    });
    // --- ここまで ---

    // NPCがクリックされたときに呼び出されるハンドラ
    const handleNpcClick = (clickedNpc: NPC) => {
        // クリックされたNPCが dialogues[1] にテキストを持っているかチェック
        const dialogues = typeof clickedNpc.dialogues === 'string'
            ? JSON.parse(clickedNpc.dialogues)
            : clickedNpc.dialogues;
        const hasDialogue = dialogues && Array.isArray(dialogues) && dialogues.length > 1 && dialogues[1];

        if (activeDialogue.isVisible && activeDialogue.npc?.id === clickedNpc.id) {
            // 現在表示中のNPCを再度クリックした場合は、対話ボックスを非表示にする
            setActiveDialogue({isVisible: false, npc: null});
        } else if (hasDialogue) {
            // 別のNPCをクリックした場合、または対話ボックスが非表示の場合は、そのNPCの対話ボックスを表示
            setActiveDialogue({isVisible: true, npc: clickedNpc});
            // 必要であれば、onInteract関数をここで呼び出す
            // if (dialogues.length > 0 && dialogues[0]) {
            //     onInteract(clickedNpc, dialogues[0]);
            // }
        } else {
            // dialogues[1] がないNPCがクリックされた場合は、対話ボックスを非表示にする
            setActiveDialogue({isVisible: false, npc: null});
        }
    };

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
                    onNpcClick={handleNpcClick} // クリックハンドラを渡す
                />
            ))}

            {/* 対話ボックスを描画 */}
            <DialogueBox activeDialogue={activeDialogue}/>
        </>
    );
};

// 単一のNPCを表示するコンポーネント (修正済み)
interface PropsSingleNpc {
    npc: NPC;
    onNpcClick: (npc: NPC) => void; // 新しく追加したプロパティ
}

const SingleNpc: React.FC<PropsSingleNpc> = ({npc, onNpcClick}) => { // プロパティでonNpcClickを受け取る
    // ローカルの吹き出し関連の状態とロジックを削除
    // const [isBubbleVisible, setIsBubbleVisible] = useState(false);
    // const [bubbleText, setBubbleText] = useState('');

    // マップ上のスプライト画像は imageIndex = 1 を使用（元のコードから変更なし）
    const imageIndex = 1;
    const validImageIndex = npc.images.length > imageIndex ? imageIndex : 0;

    // 指定したインデックスの画像を使用
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
            width={npc.x}
            height={npc.y}
            cursor="pointer"
            onClick={handleClick}
            onTap={handleClick}
        >
            {image && (
                <Image
                    image={image}
                    width={64} // スプライトの幅
                    height={64} // スプライトの高さ
                    listening={true} // クリックイベントを受け取る
                    hitStrokeWidth={0} // クリック判定を正確にするため
                    // マップ上での見栄えのために影を残す
                    shadowColor="black"
                    shadowBlur={5}
                    shadowOpacity={0.5}
                />
            )}
            {/* NPCの名前表示はDialogueBoxに移動するため、ここから削除 */}
            {/* <Text ... /> */}

            {/* 吹き出しの描画ロジックは削除 */}
            {/* {isBubbleVisible && (...) } */}
        </Group>
    );
};

export default NpcTest;
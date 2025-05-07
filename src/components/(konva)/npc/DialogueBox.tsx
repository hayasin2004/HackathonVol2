// components/DialogueBox.tsx
import React from 'react';
import { Group, Rect, Text, Image } from 'react-konva';
import useImage from 'use-image';
import { NPC } from "@/types/npc"; // あなたのNPCタイプへのパスに合わせてください
import { DialogueEntry } from '@/data/dialogues';

interface PropsDialogueBox {
    activeDialogue: {
        isVisible: boolean;
        npc: NPC | null;
        dialogueEntry: DialogueEntry | null;
        currentLineIndex: number;
    };
    onDialogueAdvance: () => void; // 対話を進める関数を追加
}

const DialogueBox: React.FC<PropsDialogueBox> = ({ activeDialogue, onDialogueAdvance }) => {
    // activeDialogue.isVisible が true で、かつ activeDialogue.npc が存在する場合のみ表示
    const { npc, dialogueEntry, currentLineIndex } = activeDialogue;

    // ポートレート画像（NPC.images の最初の画像をポートレートとして使用）
    const portraitImageUrl = npc && npc.images.length > 0 ? npc.images[0] : ''; // 画像がない場合は空文字列
    const [portraitImage] = useImage(portraitImageUrl);

    if (!activeDialogue.isVisible || !npc) {
        return null;
    }

    // 表示する対話テキスト（NPC.dialogues の 2 番目の要素を使用）
    // dialogues が文字列の場合はパースする
    const dialogues = dialogueEntry?.lines || [];
    const dialogueText = dialogues && Array.isArray(dialogues) && dialogues.length > 1 && dialogues[1]
                         ? dialogues[1]
                         : npc.dialogues; // dialogues[1] がない場合のデフォルトテキスト

    // ステージのサイズを取得（ウィンドウサイズに合わせる）
    const stageWidth = typeof window !== "undefined" ? window.innerWidth : 800;
    const stageHeight = typeof window !== "undefined" ? window.innerHeight : 600;

    // 対話ボックスのレイアウトに関する定数（必要に応じて調整してください）
    const boxHeight = 150; // ボックス全体の高さ
    const boxPadding = 20; // ボックス内の余白
    const portraitSize = 110; // キャラクターポートレートのサイズ
    const nameFontSize = 18; // 名前のフォントサイズ
    const textFontSize = 14; // テキストのフォントサイズ

    // テキストエリアの位置とサイズを計算
    const textX = boxPadding * 2 + portraitSize;
    const textY = boxPadding + nameFontSize + 5; // 名前の下に配置
    const textWidth = stageWidth - boxPadding * 3 - portraitSize;
    const textHeight = boxHeight - boxPadding * 2 - nameFontSize - 5; // テキストが表示できる最大の高さ

    // ボックスを画面下部に配置
    const boxY = stageHeight - boxHeight;

    return (
        <Group
            x={0} // 画面左端に配置
            y={boxY} // 画面下端に配置
            width={stageWidth} // 画面いっぱいの幅
            height={boxHeight} // ボックスの高さ
            // 将来的に対話を進めるためのクリックハンドラをここに追加できます
            // onClick={() => { console.log("Dialogue box clicked"); /* 対話進行ロジック */ }}
            // onTap={() => { console.log("Dialogue box tapped"); /* 対話進行ロジック */ }}
            listening={true} // クリックイベントを受け取るようにする
        >
            {/* 背景の四角形（半透明） */}
            <Rect
                width={stageWidth}
                height={boxHeight}
                fill="rgba(0, 0, 0, 0.8)" // 黒の半透明背景
            />

            {/* キャラクターポートレート */}
            {portraitImage && (
                <Image
                    image={portraitImage}
                    x={boxPadding} // 左からの余白
                    y={boxPadding} // 上からの余白
                    width={portraitSize} // ポートレートの幅
                    height={portraitSize} // ポートレートの高さ
                    perfectDrawEnabled={false} // 描画最適化（パフォーマンスに影響する場合があります）
                    alt={`Portrait of ${npc.name}`} // アクセシビリティのための代替テキスト
                />
            )}

            {/* キャラクター名 */}
            <Text
                text={npc.name}
                x={boxPadding * 2 + portraitSize} // ポートレートの右側に配置
                y={boxPadding} // ポートレートの上端に合わせる
                fontSize={nameFontSize}
                fill="#FFFFFF" // 白い文字
                fontStyle="bold"
                shadowColor="#000000" // 黒い影
                shadowBlur={3}
                shadowOffsetX={1}
                shadowOffsetY={1}
                listening={false} // クリックイベントを受け取らない
            />

            {/* 対話テキスト */}
            <Text
                text={dialogueText}
                x={textX} // 名前に合わせて配置
                y={textY} // 名前の下に配置
                fontSize={textFontSize}
                fill="#FFFFFF" // 白い文字
                width={textWidth} // テキストエリアの幅で折り返し
                height={textHeight} // テキストエリアの最大の高さ
                wrap="word" // 単語で折り返し
                lineHeight={1.5} // 行間
                verticalAlign="top" // テキストを上端に揃える
                listening={false} // クリックイベントを受け取らない
            />
             {/* （オプション）対話続行を促すマークなどをここに追加できます */}
             <Text
                text="▼" // 下矢印の例
                x={stageWidth - boxPadding - 20} // 右下付近に配置
                y={boxY + boxHeight - boxPadding - 20} // 右下付近に配置
                fontSize={16}
                fill="#FFFFFF"
                listening={false}
             />
        </Group>
    );
};

export default DialogueBox;
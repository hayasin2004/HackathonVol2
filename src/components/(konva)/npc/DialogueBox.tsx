// components/DialogueBox.tsx
import React from 'react';
import { Group, Rect, Text, Image } from 'react-konva';
import useImage from 'use-image';
import { NPC } from "@/types/npc"; // あなたのNPCタイプへのパスに合わせてください

interface PropsDialogueBox {
    activeDialogue: {
        isVisible: boolean;
        npc: NPC | null;
        currentIndex?: number; // currentIndexプロパティを追加
    };
    onClose?: () => void; // ダイアログを閉じるためのコールバック
}

const DialogueBox: React.FC<PropsDialogueBox> = ({ activeDialogue, onClose }) => {
    // activeDialogue.isVisible が true で、かつ activeDialogue.npc が存在する場合のみ表示
    if (!activeDialogue.isVisible || !activeDialogue.npc) {
        return null;
    }

    const { npc, currentIndex = 0 } = activeDialogue; // デフォルト値を0に設定

    // ポートレート画像（NPC.images の最初の画像をポートレートとして使用）
    const portraitImageUrl = npc.images.length > 0 ? npc.images[0] : undefined;
    const [portraitImage] = useImage(portraitImageUrl || '');

    // 表示する対話テキスト
    // dialogues が文字列の場合はパースする
    const dialogues = typeof npc.dialogues === 'string' ? JSON.parse(npc.dialogues) : npc.dialogues;

    // currentIndexに基づいてダイアログを表示
    const dialogueText = dialogues && Array.isArray(dialogues) && dialogues.length > currentIndex
        ? dialogues[currentIndex]
        : '（会話がありません）'; // 該当するインデックスがない場合のデフォルトテキスト

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

    // ダイアログボックスのクリックハンドラ
    const handleBoxClick = (e: any) => {
        // イベントの伝播を停止して、背景クリックイベントが発火しないようにする
        e.cancelBubble = true;

        // ダイアログボックスをクリックしても閉じる
        if (onClose) {
            onClose();
        }
    };

    return (
        <Group
            x={0} // 画面左端に配置
            y={boxY} // 画面下端に配置
            width={stageWidth} // 画面いっぱいの幅
            height={boxHeight} // ボックスの高さ
            listening={true} // クリックイベントを受け取るようにする
            zIndex={30} // zIndexを30に設定
            onClick={handleBoxClick} // ダイアログボックス自体のクリックイベント
            onTap={handleBoxClick}
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

            {/* 閉じるボタン（右上に配置） */}
            <Group
                x={stageWidth - boxPadding - 30}
                y={boxPadding}
                width={20}
                height={20}
                cursor="pointer"
            >
                <Rect
                    width={20}
                    height={20}
                    fill="rgba(80, 80, 80, 0.9)"
                    cornerRadius={3}
                    stroke="#FFFFFF"
                    strokeWidth={1}
                />
                <Text
                    text="×"
                    x={5}
                    y={1}
                    fontSize={14}
                    fill="#FFFFFF"
                    listening={false}
                />
            </Group>

            {/* 現在のダイアログインデックスと総数を表示（オプション） */}
            {dialogues && Array.isArray(dialogues) && dialogues.length > 1 && (
                <Text
                    text={`${currentIndex + 1}/${dialogues.length}`}
                    x={stageWidth - boxPadding - 50}
                    y={boxHeight - boxPadding - 20}
                    fontSize={14}
                    fill="#AAAAAA"
                    listening={false}
                />
            )}
        </Group>
    );
};

export default DialogueBox;
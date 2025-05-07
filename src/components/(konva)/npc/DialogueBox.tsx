// components/DialogueBox.tsx
import React, { useEffect, useState } from 'react';
import { Group, Rect, Text, Image } from 'react-konva';
import useImage from 'use-image';
import { NPC } from "@/types/npc";

interface PropsDialogueBox {
    activeDialogue: {
        isVisible: boolean;
        npc: NPC | null;
        currentIndex?: number;
    };
    onNextMessage?: () => void; // 次のメッセージに進むコールバック
    onPrevMessage?: () => void; // 前のメッセージに戻るコールバック
}

const DialogueBox: React.FC<PropsDialogueBox> = ({
                                                     activeDialogue,
                                                     onNextMessage,
                                                     onPrevMessage
                                                 }) => {
    // 常に同じ順序でフックを呼び出すために、条件の外でuseImageを呼び出す
    const portraitImageUrl = activeDialogue.npc?.images?.length > 0
        ? activeDialogue.npc.images[0]
        : undefined;
    const [portraitImage] = useImage(portraitImageUrl || '');

    // activeDialogue.isVisible が true で、かつ activeDialogue.npc が存在する場合のみ表示
    if (!activeDialogue.isVisible || !activeDialogue.npc) {
        return null;
    }

    const { npc, currentIndex = 0 } = activeDialogue;

    // 表示する対話テキスト
    const dialogues = typeof npc.dialogues === 'string' ? JSON.parse(npc.dialogues) : npc.dialogues;

    // currentIndexに基づいてダイアログを表示
    const dialogueText = dialogues && Array.isArray(dialogues) && dialogues.length > currentIndex
        ? dialogues[currentIndex]
        : '（会話がありません）';

    // ステージのサイズを取得（ウィンドウサイズに合わせる）
    const stageWidth = typeof window !== "undefined" ? window.innerWidth : 800;
    const stageHeight = typeof window !== "undefined" ? window.innerHeight : 600;

    // 対話ボックスのレイアウトに関する定数
    const boxHeight = 150;
    const boxPadding = 20;
    const portraitSize = 110;
    const nameFontSize = 18;
    const textFontSize = 14;

    // テキストエリアの位置とサイズを計算
    const textX = boxPadding * 2 + portraitSize;
    const textY = boxPadding + nameFontSize + 5;
    const textWidth = stageWidth - boxPadding * 3 - portraitSize;
    const textHeight = boxHeight - boxPadding * 2 - nameFontSize - 5;

    // ボックスを画面下部に配置
    const boxY = stageHeight - boxHeight;

    // 前のメッセージに戻るボタンを表示するかどうか
    const showPrevButton = currentIndex > 0;

    // 次のメッセージに進むボタンを表示するかどうか
    const showNextButton = dialogues && Array.isArray(dialogues) && currentIndex < dialogues.length - 1;

    // 前のメッセージに戻るボタンをクリックしたときのハンドラ
    const handlePrevClick = () => {
        if (showPrevButton && onPrevMessage) {
            onPrevMessage();
        }
    };

    // 次のメッセージに進むボタンをクリックしたときのハンドラ
    const handleNextClick = () => {
        if (showNextButton && onNextMessage) {
            onNextMessage();
        }
    };

    return (
        <Group
            x={0}
            y={boxY}
            width={stageWidth}
            height={boxHeight}
            listening={true}
        >
            {/* 背景の四角形（半透明） */}
            <Rect
                width={stageWidth}
                height={boxHeight}
                fill="rgba(0, 0, 0, 0.8)"
            />

            {/* キャラクターポートレート */}
            {portraitImage && (
                <Image
                    image={portraitImage}
                    x={boxPadding}
                    y={boxPadding}
                    width={portraitSize}
                    height={portraitSize}
                    perfectDrawEnabled={false}
                />
            )}

            {/* キャラクター名 */}
            <Text
                text={npc.name}
                x={boxPadding * 2 + portraitSize}
                y={boxPadding}
                fontSize={nameFontSize}
                fill="#FFFFFF"
                fontStyle="bold"
                shadowColor="#000000"
                shadowBlur={3}
                shadowOffsetX={1}
                shadowOffsetY={1}
                listening={false}
            />

            {/* 対話テキスト */}
            <Text
                text={dialogueText}
                x={textX}
                y={textY}
                fontSize={textFontSize}
                fill="#FFFFFF"
                width={textWidth}
                height={textHeight}
                wrap="word"
                lineHeight={1.5}
                verticalAlign="top"
                listening={false}
            />

            {/* 前のメッセージに戻るボタン */}
            {showPrevButton && (
                <Group
                    x={stageWidth - boxPadding - 120}
                    y={boxY + boxHeight - boxPadding - 30}
                    width={40}
                    height={30}
                    onClick={handlePrevClick}
                    onTap={handlePrevClick}
                    cursor="pointer"
                >
                    <Rect
                        width={40}
                        height={30}
                        fill="rgba(50, 50, 50, 0.7)"
                        cornerRadius={5}
                    />
                    <Text
                        text="◀"
                        x={12}
                        y={5}
                        fontSize={16}
                        fill="#FFFFFF"
                        listening={false}
                    />
                </Group>
            )}

            {/* 次のメッセージに進むボタン */}
            {showNextButton && (
                <Group
                    x={stageWidth - boxPadding - 60}
                    y={boxY + boxHeight - boxPadding - 30}
                    width={40}
                    height={30}
                    onClick={handleNextClick}
                    onTap={handleNextClick}
                    cursor="pointer"
                >
                    <Rect
                        width={40}
                        height={30}
                        fill="rgba(50, 50, 50, 0.7)"
                        cornerRadius={5}
                    />
                    <Text
                        text="▶"
                        x={12}
                        y={5}
                        fontSize={16}
                        fill="#FFFFFF"
                        listening={false}
                    />
                </Group>
            )}

            {/* 現在のダイアログインデックスと総数を表示 */}
            {dialogues && Array.isArray(dialogues) && dialogues.length > 1 && (
                <Text
                    text={`${currentIndex + 1}/${dialogues.length}`}
                    x={stageWidth - boxPadding - 50}
                    y={boxY + boxHeight - boxPadding - 60}
                    fontSize={14}
                    fill="#AAAAAA"
                    listening={false}
                />
            )}
        </Group>
    );
};

export default DialogueBox;
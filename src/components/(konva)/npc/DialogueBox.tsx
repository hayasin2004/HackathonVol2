// components/DialogueBox.tsx
import React from 'react';
import { Group, Rect, Text, Image } from 'react-konva';
import useImage from 'use-image';
import { NPC } from "@/types/npc";

interface PropsDialogueBox {
    activeDialogue: {
        isVisible: boolean;
        npc: NPC | null;
        currentIndex?: number;
    };
    onClose?: () => void;
    onNextDialogue?: () => void;
    onPrevDialogue?: () => void;
}

const DialogueBox: React.FC<PropsDialogueBox> = ({ activeDialogue, onClose, onNextDialogue, onPrevDialogue }) => {
    // activeDialogue.isVisible が true で、かつ activeDialogue.npc が存在する場合のみ表示
    if (!activeDialogue.isVisible || !activeDialogue.npc) {
        return null;
    }

    const { npc, currentIndex = 0 } = activeDialogue;

    // ポートレート画像
    const portraitImageUrl = npc.images.length > 0 ? npc.images[0] : undefined;
    const [portraitImage] = useImage(portraitImageUrl || '');

    // 表示する対話テキスト
    const dialogues = typeof npc.dialogues === 'string' ? JSON.parse(npc.dialogues) : npc.dialogues;
    const dialogueText = dialogues && Array.isArray(dialogues) && dialogues.length > currentIndex
        ? dialogues[currentIndex]
        : '（会話がありません）';

    // ステージのサイズを取得
    const stageWidth = typeof window !== "undefined" ? window.innerWidth : 800;
    const stageHeight = typeof window !== "undefined" ? window.innerHeight : 600;

    // レイアウト設定
    const boxHeight = 150;
    const boxPadding = 20;
    const portraitSize = 110;
    const nameFontSize = 18;
    const textFontSize = 14;

    // テキストエリアの位置とサイズ
    const textX = boxPadding * 2 + portraitSize;
    const textY = boxPadding + nameFontSize + 5;
    const textWidth = stageWidth - boxPadding * 3 - portraitSize;
    const textHeight = boxHeight - boxPadding * 2 - nameFontSize - 5;

    // ボックスを画面下部に配置
    const boxY = stageHeight - boxHeight;

    // ナビゲーションボタンのサイズと位置
    const navButtonSize = 30;
    const navButtonY = boxHeight - boxPadding - navButtonSize; // boxYを含めない相対位置

    // 3番NPCの特殊処理：ダイアログの総数と表示インデックスを調整
    let totalDialogues = dialogues?.length || 0;
    let displayCurrentIndex = currentIndex + 1; // デフォルトは通常通り
    let showPrevButton = currentIndex > 0;
    let showNextButton = dialogues && Array.isArray(dialogues) && currentIndex < dialogues.length - 1;

    // 3番NPCの場合、移動前と移動後で表示を変える
    if (npc.id === 3) {
        // ローカルストレージから状態を取得
        const savedStates = localStorage.getItem("npcDialogueStates");
        let npcState = null;

        if (savedStates) {
            try {
                const states = JSON.parse(savedStates);
                npcState = states[npc.id];
            } catch (e) {
                console.error("NPCの対話状態の読み込みに失敗しました:", e);
            }
        }

        const targetX = 1024;
        const targetY = 2176;
        const hasMoved = npcState?.x === targetX && npcState?.y === targetY;

        if (!hasMoved) {
            // 移動前は1～8個目のみ表示
            totalDialogues = 8; // 総数は8個
            // 現在のインデックスがそのまま表示インデックスになる
            displayCurrentIndex = currentIndex + 1;

            // 8個目より後は表示しない
            showNextButton = currentIndex < Math.min(7, dialogues.length - 1);
        } else {
            // 移動後は9～12個目のみ表示
            totalDialogues = 4; // 9～12の4個

            // 表示インデックスを調整: 8以降のインデックスを0から始まるように調整
            const adjustedIndex = currentIndex - 8;
            displayCurrentIndex = adjustedIndex + 1; // 1から始まる表示用

            // ナビゲーションボタンの表示条件を調整
            showPrevButton = adjustedIndex > 0;
            showNextButton = currentIndex < dialogues.length - 1;
        }
    }

    // ダイアログボックスのクリックハンドラ
    const handleBoxClick = (e: any) => {
        e.cancelBubble = true;
    };

    // 閉じるボタンのクリックハンドラ
    const handleCloseClick = (e: any) => {
        e.cancelBubble = true;
        if (onClose) {
            onClose();
        }
    };

    // 次へボタンのクリックハンドラ
    const handleNextClick = (e: any) => {
        e.cancelBubble = true;
        if (onNextDialogue) {
            onNextDialogue();
        }
    };

    // 前へボタンのクリックハンドラ
    const handlePrevClick = (e: any) => {
        e.cancelBubble = true;
        if (onPrevDialogue) {
            onPrevDialogue();
        }
    };

    return (
        <Group
            x={0}
            y={boxY}
            width={stageWidth}
            height={boxHeight}
            listening={true}
            onClick={handleBoxClick}
            onTap={handleBoxClick}
        >
            {/* 背景の四角形 */}
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

            {/* 閉じるボタン */}
            <Group
                x={stageWidth - boxPadding - 30}
                y={boxPadding}
                width={20}
                height={20}
                cursor="pointer"
                onClick={handleCloseClick}
                onTap={handleCloseClick}
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

            {/* 前へボタン */}
            {showPrevButton && (
                <Group
                    x={textX}
                    y={navButtonY}
                    width={navButtonSize}
                    height={navButtonSize}
                    cursor="pointer"
                    onClick={handlePrevClick}
                    onTap={handlePrevClick}
                >
                    <Rect
                        width={navButtonSize}
                        height={navButtonSize}
                        fill="rgba(80, 80, 80, 0.9)"
                        cornerRadius={3}
                        stroke="#FFFFFF"
                        strokeWidth={1}
                    />
                    <Text
                        text="◀"
                        x={8}
                        y={7}
                        fontSize={14}
                        fill="#FFFFFF"
                        listening={false}
                    />
                </Group>
            )}

            {/* 次へボタン */}
            {showNextButton && (
                <Group
                    x={textX + navButtonSize + 10}
                    y={navButtonY}
                    width={navButtonSize}
                    height={navButtonSize}
                    cursor="pointer"
                    onClick={handleNextClick}
                    onTap={handleNextClick}
                >
                    <Rect
                        width={navButtonSize}
                        height={navButtonSize}
                        fill="rgba(80, 80, 80, 0.9)"
                        cornerRadius={3}
                        stroke="#FFFFFF"
                        strokeWidth={1}
                    />
                    <Text
                        text="▶"
                        x={8}
                        y={7}
                        fontSize={14}
                        fill="#FFFFFF"
                        listening={false}
                    />
                </Group>
            )}

            {/* 現在のダイアログインデックスと総数を表示 */}
            {dialogues && Array.isArray(dialogues) && dialogues.length > 1 && (
                <Text
                    text={`${displayCurrentIndex}/${totalDialogues}`}
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
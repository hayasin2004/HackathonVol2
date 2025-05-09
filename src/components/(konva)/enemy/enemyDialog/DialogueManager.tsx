import React from "react";
import { Group, Rect, Text } from "react-konva";
import { Enemy } from "@/types/enemy";

interface DialogueBoxProps {
    activeDialogue: {
        isVisible: boolean;
        npc: Enemy | null;
        currentIndex?: number;
    };
    dialogueContent: string | null; // ダイアログ内容を受け取る
    onClose: () => void;
    onNextDialogue: () => void;
    onPrevDialogue: () => void;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({
                                                     activeDialogue,
                                                     dialogueContent,
                                                     onClose,
                                                     onNextDialogue,
                                                     onPrevDialogue, 
                                                 }) => {
    if (!activeDialogue.isVisible || !dialogueContent) return null;

    const boxWidth = 300;
    const boxHeight = 120;
    const padding = 10;

    return (
        <Group >
            {/* 背景用の矩形 */}
            <Rect
                width={boxWidth}
                height={boxHeight}
                fill="rgba(0, 0, 0, 0.8)"
                cornerRadius={10}
            />
            {/* ダイアログテキスト */}
            <Text
                text={dialogueContent}
                fontSize={14}
                fill="white"
                padding={padding}
                width={boxWidth - 2 * padding}
                height={boxHeight - 2 * padding}
                lineHeight={1.5}
            />
            {/* 閉じるボタン */}
            <Text
                text="Close"
                fontSize={12}
                fill="red"
                x={boxWidth - 50}
                y={boxHeight - 20}
                onClick={onClose}
                onTap={onClose}
                cursor="pointer"
            />
            {/* 次のダイアログボタン */}
            <Text
                text="Next"
                fontSize={12}
                fill="blue"
                x={boxWidth - 100}
                y={boxHeight - 20}
                onClick={onNextDialogue}
                onTap={onNextDialogue}
                cursor="pointer"
            />
            {/* 前のダイアログボタン */}
            <Text
                text="Prev"
                fontSize={12}
                fill="blue"
                x={boxWidth - 150}
                y={boxHeight - 20}
                onClick={onPrevDialogue}
                onTap={onPrevDialogue}
                cursor="pointer"
            />
        </Group>
    );
};

export default DialogueBox;
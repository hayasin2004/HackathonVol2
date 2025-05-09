import React, { useState, useEffect, useCallback } from "react";
import DialogueBox from "@/components/(konva)/npc/DialogueBox";
import { Enemy } from "@/types/enemy";

interface EnemyDialogManagerProps {
    onDialogOpen?: (isOpen: boolean) => void;
}

const EnemyDialogManager: React.FC<EnemyDialogManagerProps> = ({ onDialogOpen }) => {
    const [activeDialogue, setActiveDialogue] = useState<{
        isVisible: boolean;
        enemy: Enemy | null;
        currentIndex?: number;
    }>({
        isVisible: false,
        enemy: null,
        currentIndex: 0,
    });

    // ダイアログを開く
    const openDialogue = useCallback((enemy: Enemy) => {
        const enemyDialogues = typeof enemy.dialogues === "string"
            ? JSON.parse(enemy.dialogues)
            : enemy.dialogues;

        const enemyWithDialogues = {
            ...enemy,
            dialogues: Array.isArray(enemyDialogues) ? enemyDialogues : [],
        };

        setActiveDialogue({
            isVisible: true,
            enemy: enemyWithDialogues,
            currentIndex: 0,
        });

        if (onDialogOpen) {
            onDialogOpen(true);
        }
    }, [onDialogOpen]);

    // ダイアログを閉じる
    const closeDialogue = useCallback(() => {
        setActiveDialogue({
            isVisible: false,
            enemy: null,
            currentIndex: 0,
        });

        if (onDialogOpen) {
            onDialogOpen(false);
        }
    }, [onDialogOpen]);

    // 次のダイアログへ
    const nextDialogue = useCallback(() => {
        if (activeDialogue.enemy && Array.isArray(activeDialogue.enemy.dialogues)) {
            const nextIndex = activeDialogue.currentIndex! + 1;
            if (nextIndex < activeDialogue.enemy.dialogues.length) {
                setActiveDialogue((prev) => ({
                    ...prev,
                    currentIndex: nextIndex,
                }));
            }
        }
    }, [activeDialogue]);

    // 前のダイアログへ
    const prevDialogue = useCallback(() => {
        if (activeDialogue.enemy && Array.isArray(activeDialogue.enemy.dialogues)) {
            const prevIndex = activeDialogue.currentIndex! - 1;
            if (prevIndex >= 0) {
                setActiveDialogue((prev) => ({
                    ...prev,
                    currentIndex: prevIndex,
                }));
            }
        }
    }, [activeDialogue]);

    return (
        <DialogueBox
            activeDialogue={activeDialogue}
            onClose={closeDialogue}
            onNextDialogue={nextDialogue}
            onPrevDialogue={prevDialogue}
        />
    );
};

export default EnemyDialogManager;
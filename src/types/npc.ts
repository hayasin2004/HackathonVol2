import { JsonValue } from "@prisma/client/runtime/library";

export interface NPC {
    id: number;
    name: string;
    x: number;
    y: number;
    images: string[];
    dialogues : string[]
    stageStatus: number;
    questId?: number;     
}

export interface Dialogue {
    id: number;
    text: string;
    options?: DialogueOption[];
    nextDialogueId?: number;
}

export interface DialogueOption {
    text: string;
    nextDialogueId: number;
    action?: () => void;
}

// Prismaから返されるNPCデータをアプリケーションで使用するNPC型に変換するヘルパー関数
export function convertPrismaDialoguesToNPC(prismaData: any): NPC {
    // dialoguesがJSON文字列の場合はパースする
    let dialogues = prismaData.dialogues;
    if (typeof dialogues === 'string') {
        dialogues = JSON.parse(dialogues);
    }
    
    return {
        ...prismaData,
        dialogues
    };
}
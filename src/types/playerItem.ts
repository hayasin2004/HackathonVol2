import {defaultItem} from "@/types/defaultItem";

export interface PlayerItem {
    id: number;
    playerId: number | null;
    x?: number | null;
    y?: number | null;
    createdAt: Date;
    updatedAt: Date;
}
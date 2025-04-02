import {defaultItem} from "@/types/defaultItem";

export interface PlayerItem {
    id: number;
    playerId: number | null;
    x: number;
    y: number;
    createdAt: Date;
    updatedAt: Date;
}
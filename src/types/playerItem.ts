

export interface PlayerItem {
    id: number;
    playerId: number | null;
    x?: number | null;
    y?: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PlayerHaveItem {
    id: number;
    playerDataId: number;
    playerId : number
    itemId: number;
    quantity: number;
    DefaultItemList: {
        id: number;
        itemName: string;
        itemDescription: string;
        itemIcon: string;
    };
}
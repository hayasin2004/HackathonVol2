export interface CharacterPartsType {
    character?: {
        id: number;
        userId: number;
        parts: JsonValue;
        createdAt: Date;
        updatedAt: Date;
    } | null; // nullも許容

    itemArray? :Array<{
        id:number;
        itemName:string;
        x? : number
        y? : number
        width? : number
        height? : number
        itemDescription:string;
    }> | null
}


//characterの位置を保存する
export interface PlayerCoordinateProps  {
    userId?: number;
    x?: number;
    y?: number;
};


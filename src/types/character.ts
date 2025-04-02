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

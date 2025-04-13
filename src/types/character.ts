import {PlayerItem} from "@/types/playerItem";
import {JsonValue} from "@prisma/client/runtime/binary";
import {defaultItem} from "@/types/defaultItem";

export interface CharacterPartsType {
    character?: {
        id: number;
        userId: number;
        parts: JsonValue;
        createdAt: Date;
        updatedAt: Date;　
    } | null; // nullも許容

    playerData: PlayerItem | null; // nullも許容

    itemArray :Array<{
        id:number;
        itemIcon:string | null;
        itemName?:string;
        x? : number | null
        y? : number | null
        width? : number | null
        height? : number | null
        itemDescription:string;
    }> | null

    needCraftItem : Array<defaultItem> | null
}


//characterの位置を保存する
export interface PlayerCoordinateProps  {
    userId?: number;
    x?: number;
    y?: number;
};


export interface CharacterImageData {
    iconImage: string[]; // 画像URLの配列
}

export interface defaultItem{
    id:number;
    itemName?:string;
    itemIcon:string | null;
    x?: number | null
    y?: number| null
    width? : number  | null
    height? : number | null
    itemDescription:string;
}

export interface RoomDefaultItem{
    id:number;
    itemName?:string;
    itemIcon:string | null;
    x?: number | null
    y?: number| null
    tileX : number
    tileY : number
    width? : number  | null
    height? : number | null
    itemDescription:string;
}

export interface RandomDefaultItem{
    id:number;
    itemName?:string;
    itemIcon:string | null;
    x?: number | null
    y?: number| null
    tileX : number
    tileY : number
    width? : number  | null
    height? : number | null
    itemDescription:string;
    _uniqueId: string;
}
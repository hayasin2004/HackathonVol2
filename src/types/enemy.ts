
export interface Enemy {
    id: number;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    images: string[];
    hp: number;
    attack: number;
    damage: number;
    dialogues : string[]
    movementPattern: {type :  string };
    stageStatus: number;
    dropItems?: number[];
}

export interface MovementPattern {
    type: 'random' | 'patrol' | 'chase' | 'stationary';
    params?: {
        speed?: number;
        path?: { x: number; y: number }[];
        range?: number;
        interval?: number;
    };
}

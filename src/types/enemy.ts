
export interface Enemy {
    id: number;
    name: string;
    x: number;
    y: number;
    images: string[];
    health: number;
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

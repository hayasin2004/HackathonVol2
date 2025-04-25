
export interface Enemy {
    id: number;
    name: string;
    positionX: number;
    positionY: number;
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

export interface PlayerType {
    id: number;
    username: string;
    email: string;
    password: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface propsPlayerType {
    detailPlayer : {
        id: number;
        username: string;
        email: string;
        password: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null
}
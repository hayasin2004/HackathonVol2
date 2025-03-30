export interface PlayerType {
    id: number;
    username: string;
    email: string;
    password: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// フォローボタンコンポーネントに渡す用
export interface propsPlayerType {
    detailPlayer: {
        id?: number;
        username?: string;
        email?: string;
        password?: string;
        description?: string | null;
        createdAt?: Date;
        updatedAt?: Date;
    } | null
}

// フォロー取得用の型指定
export interface propsFollowingsPlayerType {
    followings: {
        id: number;
        username: string;
        email?: string; // オプションに変更
        password?: string; // オプションに変更
        description?: string | null; // オプションに変更
        createdAt?: Date; // オプションに変更
        updatedAt?: Date; // オプションに変更
    };
}

// フォロワー取得用の型指定
export interface propsFollowersPlayerType {
    followers: {
        id: number;
        username: string;
        email: string;
        password?: string;
        description?: string | null;
        createdAt?: Date;
        updatedAt?: Date;
    }
}

// DetailPlayerTypes
export interface  DetailPlayerTypes {
    detailPlayerData: PlayerType | null;
    detailPlayerDataFollowingsList: propsFollowingsPlayerType[]
    detailPlayerDataFollowersList: propsFollowersPlayerType[]
}


//DetailFollowButton用型指定
export interface propsPlayerDetailFollowType {
    id?: number
    detailPlayer: {
        followings: {
            id?: number;
            username?: string;
            email?: string;
            password?: string;
            description?: string | null;
            createdAt?: Date;
            updatedAt?: Date;
        }
    } | null
}

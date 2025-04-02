// 成功するダミーデータ
export const successPlayerData = {
    id: 1,
    playerId: 1,
    haveItems: [
        { id: 3, itemId: 1, quantity: 1 },  // 木材 1個
        { id: 4, itemId: 14, quantity: 1 },  // 石炭 1個
    ]
};

export const successCraftItem = {
    id: 1,
    createdItemId: 15,  // 石炭
    materials: [
        { materialItemId: 1, quantity: 1 }, // 木材 1個
        { materialItemId: 14, quantity: 1 }  // 石炭 1個
    ]
};

// 失敗するダミーデータ（素材不足）
export const failPlayerData = {
    id: 2,
    playerId: 2,
    haveItems: [
        { id: 201, itemId: 2, quantity: 1 },  // 木材 1個（足りない）
        { id: 202, itemId: 3, quantity: 1 }   // 鉄 1個（足りている）
    ]
};

export const failCraftItem = {
    id: 301,
    createdItemId: 10,  // 木の剣
    materials: [
        { materialItemId: 2, quantity: 2 }, // 木材 2個（足りない）
        { materialItemId: 3, quantity: 1 }  // 鉄 1個（足りている）
    ]
};

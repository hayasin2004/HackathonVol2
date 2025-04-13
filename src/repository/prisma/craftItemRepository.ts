export const craftItem = async (playerDataId: number, craftItemId: number) => {
    const response = await fetch("/api/item/craftItem", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({playerDataId, craftItemId}),
    });
    return await response.json();
};
// "use server" →　HTTPリクエストなのにSSGにするから矛盾が起きてリクエスト届かない？？？

export const updatePlayerItems = async (playerId: number) => {
    try {
        const response = await fetch(`/api/player/getItems/${playerId}`);
        const data = await response.json();
        if (data.status === "success") {
            return {item : data.items};
        }
        else {
            console.log("クラフト上でエラーが発生しました。")
            return ;
        }
    } catch (err) {
        console.error("アイテム取得に失敗しました:", err);
    }
};
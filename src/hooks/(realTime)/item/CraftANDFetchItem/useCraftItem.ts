import {useEffect, useState} from 'react';
import {PlayerHaveItem, PlayerItem} from "@/types/playerItem";

const useCraftItem = (craftEvents : any[]) => {
    const [craftItems, setCraftItems] = useState<PlayerHaveItem[]>([]);
    useEffect(() => {

        const ItemFunction = async () => {

            await fetch(`/api/item/getCraftItems`, {method: "GET"})
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === "success") {
                        setCraftItems(data.craftItems);
                    }
                })
                .catch((err) => console.error("アイテム作成に失敗しました:", err));
        }
        ItemFunction()

    }, [craftEvents])
    return craftItems
};

export default useCraftItem;

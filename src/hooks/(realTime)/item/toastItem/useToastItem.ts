import {useState} from "react";
import {toast} from "react-toastify";

const useToastItem = (clearGotItems: () => void) => {
    const [eCollisionGotItem, setECollisionGotItem] = useState<string[]>([]);

    const triggerToast = (items: string[]) => {
        const getItemNameMap: { [key: string]: string } = {
            tree: "木の棒",
            stone: "石",
            coal: "石炭",
            iron: "鉄",
            flower: "花",
            mushroom: "キノコ",
            insect: "虫",
            water: "不思議な水",
        };
        items.forEach((item, index) => {
            const getItemName = getItemNameMap[item];
            if (!getItemName) return;

            toast.success(`アイテムを取得しました: ${getItemName}`, {
                toastId: `${item}-${index}`,
            });
        });

        // 通知後に初期化
        clearGotItems();
    };

    return {
        setECollisionGotItem,
        triggerToast,
    };
};

export default useToastItem
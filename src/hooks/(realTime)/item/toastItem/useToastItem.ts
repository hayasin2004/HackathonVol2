import {useState} from "react";
import {toast} from "react-toastify";

// アイテムオブジェクトの型定義（実際のプロジェクトの型に合わせて調整してください）
interface ItemObject {
    id?: number;
    name?: string;
    type?: string;
    itemName?: string;
    // その他のプロパティ
    [key: string]: any; // 追加のプロパティに対応
}

const useToastItem = (clearGotItems: () => void) => {
    // 型を変更: string[] から any[] へ
    const [eCollisionGotItem, setECollisionGotItem] = useState<any[]>([]);

    const triggerToast = (items: any[]) => {　

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
            // itemがオブジェクトの場合の処理
            if (typeof item === 'object' && item !== null) {
                // アイテムの種類を特定するためのキー
                // 実際のデータ構造に合わせて、name, type, itemType などを使用
                const itemType = item.name || item.type || item.itemName || item.itemType;

                if (itemType) {
                    const getItemName = getItemNameMap[itemType];
                    if (getItemName) {
                        toast.success(`アイテムを取得しました: ${getItemName}`, {
                            toastId: `${itemType}-${index}`,
                        });
                    } else {
                        // マッピングがない場合は、itemTypeをそのまま使用
                        toast.success(`アイテムを取得しました: ${itemType}`, {
                            toastId: `${itemType}-${index}`,
                        });
                    }
                } else {
                    // デバッグ用：アイテム構造を確認
                    console.log("アイテム構造:", item);
                    toast.info(`新しいアイテムを取得しました`, {
                        toastId: `unknown-${index}`,
                    });
                }
            } else {
                // 従来の文字列ベースの処理
                const getItemName = getItemNameMap[item];
                if (!getItemName) return;
                toast.success(`アイテムを取得しました: ${getItemName}`, {
                    toastId: `${item}-${index}`,
                });
            }
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
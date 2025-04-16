import React, {useEffect, useState} from 'react';
import {PlayerHaveItem, PlayerItem} from "@/types/playerItem";
import {craftItem, updatePlayerItems} from "@/repository/prisma/craftItemRepository";
import useFetchItem from "@/hooks/(realTime)/item/fetchItem/useFetchItem";
import useCraftItem from "@/hooks/(realTime)/item/CraftANDFetchItem/useCraftItem";
import styles from "@/components/(konva)/grassmap/page.module.css";
import Image from "next/image";
import {toast, ToastContainer} from "react-toastify";
import prisma from "@/lib/prismaClient";

// Propsの型を定義する
interface PlayerInventoryProps {
    playerId: PlayerItem
    eCollisionGotItem: string[]
    craftEvents: any[]

}



const PlayerInventory: React.FC<PlayerInventoryProps> = ({playerId, eCollisionGotItem, craftEvents}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [playerItems, setPlayerItems] = useState<PlayerHaveItem[] | null>(null);
    const [craftItems, setCraftItems] = useState<any[]>([]);
    const [selectedItemId, setSelectedItemId] = useState("");

    // ----------------------------
    // プレイヤーとクラフトアイテムの取得
    // ----------------------------
    const {playerItemsData, isLoadingGet} = useFetchItem(playerId, eCollisionGotItem)
    const GetCraftItem = useCraftItem(craftEvents)

    useEffect(() => {
        if (!isLoadingGet) {
            setPlayerItems(playerItemsData)
            setCraftItems(GetCraftItem)
        }

    }, [playerItemsData, isLoadingGet, eCollisionGotItem, craftEvents]);
    // アイテムクラフト関数
    const handleCraftItem = async (craftItemId: number) => {
        try {
            const playerDataId = playerId.playerId
            if (playerDataId) {
                const response = await craftItem(playerDataId, craftItemId);
                if (response.status === "success") {
                    const response = await updatePlayerItems(playerId.id);
                    if (response) {
                        setPlayerItems(response.item);
                    }

                    // addNotification("アイテムをクラフトしました");
                } else {
                    // addNotification(`クラフト失敗: ${response.message}`);
                }
            } else {
                throw new Error("ユーザIDを取得することができませんでした")
            }
        } catch (error) {
            console.error("Craft error:", error);
            // addNotification("クラフト中にエラーが発生しました");
        }
    };

    // クラフトをプルダウンメニュー化
    const handleSelectChange = (e: any) => {
        setSelectedItemId(e);
    };

    const handleCraftClick = () => {
        if (selectedItemId) {
            const selectedItem = craftItems.find(
                (item) => item.id === Number(selectedItemId)
            );
            handleCraftItem(Number(selectedItemId));
            if (selectedItem) {
                toast.success(`${selectedItem.createdItem.itemName} を獲得した！`);
            }
        }
    };

    // 拓がやること
    // testRepositoryの中にあるcraftItem参考にして
    // inventoryでアイテム選択した状態で設置 or 破壊ボタンをクリックするとマイナスされる機能　
    // →　非同期でinventoryにあるアイテムの個数も減らして
    // これができたら画面下側にマイクラみたいなアイテム一覧を作成して
    // Break(itemId , PlayerId)
    // わからないこと
    // プレイヤーの位置情報の持ってくる方法
    // まずおかれているアイテム(defaultItem)がマップ配置されているがそれを取得したときに消すとなるとdefaultItemを消すことにならないか
    // ユーザーがアイテムを獲得した状態をどのようにして新しい関数に入れていけばいいかわからない
    // ランダムに動くアイテムの座標をどのようにして使うのか
    const ItemBreak　 = async (playerId:number|undefined) => {

        const player = await prisma.playerData.findUnique({
            where: { playerId },
            include: { haveItems: true }, // プレイヤーの所持アイテムも取得
        });
        if (!player) {
            throw new Error("プレイヤーが見つかりません");
        }

    }

    return (

        <>
            <button
                className={styles.fixedOpenButton}
                onClick={() => setIsOpen(true)}
            >
                クリエイト
            </button>


            {
                isOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>×</button>
                            <div className={styles.inventory}>
                                <h3>インベントリ</h3>
                                <table className={styles.inventoryTable}>
                                    <thead>
                                    <tr>
                                        <th>アイテム名</th>
                                        <th>個数</th>
                                    </tr>
                                    </thead>
                                    <tbody>


                                    {playerItems?.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.DefaultItemList.itemName}</td>
                                            <td>{item.quantity}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.crafting}>
                                <h3 className={styles.heading}>クラフトメニュー</h3>

                                <p className={styles.selectedInfo}>選択中: {selectedItemId || '-- アイテムを選択 --'}</p>

                                <div className={styles.craftButtonContainer}>
                                    {craftItems.map((craftItem) => (
                                        <div
                                            className={`${styles.craftButtons} ${selectedItemId === craftItem.createdItem.id ? styles.selected : ''}`}
                                            key={craftItem.id}
                                            onClick={() => handleSelectChange(craftItem.id)}
                                        >
                                                <span
                                                    className={styles.itemName}>{craftItem.createdItem.itemName}</span>
                                            <Image
                                                src={craftItem.createdItem.itemIcon}
                                                alt={craftItem.createdItem.itemName}
                                                width={64}
                                                height={64}
                                            />
                                        </div>
                                    ))}
                                </div>


                                <button
                                    className={styles.buttonCreate}
                                    onClick={handleCraftClick}
                                    disabled={!selectedItemId}
                                >
                                    作成
                                </button>
                            </div>
                            {/*<button onClick={() => ItemBreak}>破壊</button>*/}
                        </div>
                    </div>
                )
            }
            <ToastContainer
                position="top-right"          // 表示位置
                autoClose={1000}              // 自動で閉じるまでの時間
                hideProgressBar={false}
                newestOnTop={true}            // 新しい通知が上にくる
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={100}                     // 最大同時表示数（これ大事！）
            />

        </>
    )
        ;
};

export default PlayerInventory;

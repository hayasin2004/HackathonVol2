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
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    const handleItemClick = (itemId) => {
        if (selectedItemId === itemId) {
            console.log(`Place item with ID: ${selectedItemId}`);
            // アイテムを配置するロジック
            setSelectedItemId(null); // 配置後に選択を解除する
        } else {
            setSelectedItemId(itemId);
        }
    };

    // 右クリックハンドラを修正
    const handleItemRightClick = (event : React.MouseEvent<HTMLDivElement>, itemId) => {
        // コンテキストメニューを防止
        event.preventDefault();
        event.stopPropagation();
        console.log(`右クリックでアイテムを置いたよ: ${itemId}`);
        // アイテムを配置するロジック
        // ここに配置ロジックを実装

        // 選択を解除
        setSelectedItemId(null);
        return false; // イベントの伝播を止める
    };

    // コンテキストメニューを完全に無効化するためのグローバルハンドラ
    useEffect(() => {
        const disableContextMenu = (e) => {
            if (e.target.closest(`.${styles.inventoryUnderItem}`)) {
                e.preventDefault();
                return false;
            }
        };

        // コンポーネントがマウントされたときにイベントリスナーを追加
        document.addEventListener('contextmenu', disableContextMenu);

        // クリーンアップ関数
        return () => {
            document.removeEventListener('contextmenu', disableContextMenu);
        };
    }, []);
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'p' && selectedItemId !== null) {
                console.log(`アイテムを置いたよ: ${selectedItemId}`);

                // // アイテムを配置するロジック
                // setSelectedItemId(null); // 配置後に選択を解除する
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        // クリーンアップ関数
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [selectedItemId]);

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

    // 最優先 オブジェクトをstorageに保存するようにするしかない
    const ItemBreak = async (playerId: number | undefined) => {
        const player = await prisma.playerData.findUnique({
            where: {playerId},
            include: {haveItems: true}, // プレイヤーの所持アイテムも取得
        });
        if (!player) {
            throw new Error("プレイヤーが見つかりません");
        }
    }

    // アイテムを配置する関数
    const placeItem = (itemId) => {
        // ここにアイテム配置のロジックを実装
        console.log(`アイテム ${itemId} を配置しました`);
        // 必要に応じてサーバーと通信したり、状態を更新したりする
    };

    return (
        <>
            <div className={styles.inventoryUnder}>
                {playerItems?.map((item) => (
                    <div
                        key={item.id}
                        className={`${styles.inventoryUnderItem} ${selectedItemId === item.itemId ? styles.inventorySelected : ''}`}
                        onClick={() => handleItemClick(item.itemId)}
                        onContextMenu={(event) => handleItemRightClick(event, item.itemId)}
                        onMouseDown={(event) => {
                            // 右クリック（button=2）の場合、追加の処理
                            if (event.button === 2) {
                                event.preventDefault();
                                handleItemRightClick(event, item.itemId);
                            }
                        }}
                    >
                        <Image
                            src={item.DefaultItemList.itemIcon || ""}
                            alt={item.DefaultItemList.itemName}
                            width={40}
                            height={40}
                            draggable={false}
                        />
                        <span className={styles.inventoryItemUnderQuantity}>{item.quantity}</span>
                    </div>
                ))}
                <button
                    className={styles.inventoryUnderItem}
                    onClick={() => setIsOpen(true)}
                >
                    ク
                </button>
            </div>

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
                                            <span className={styles.itemName}>{craftItem.createdItem.itemName}</span>
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
                limit={100}                   // 最大同時表示数
            />
        </>
    );
};

export default PlayerInventory;

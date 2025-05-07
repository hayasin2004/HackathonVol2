import React, {useEffect, useState} from 'react';
import {PlayerHaveItem, PlayerItem} from "@/types/playerItem";
import {craftItem, updatePlayerItems} from "@/repository/prisma/craftItemRepository";
import useFetchItem from "@/hooks/(realTime)/item/fetchItem/useFetchItem";
import useCraftItem from "@/hooks/(realTime)/item/CraftANDFetchItem/useCraftItem";
import styles from "@/components/(konva)/grassmap/page.module.css";
import Image from "next/image";
import {toast, ToastContainer} from "react-toastify";
import prisma from "@/lib/prismaClient";
import {objectItemIconImage} from "@/hooks/(realTime)/test/useRemakeItemGet";
import {io, Socket} from "socket.io-client";

// Propsの型を定義する
interface PlayerInventoryProps {
    roomId: number
    playerId: PlayerItem
    eCollisionGotItem: string[]
    craftEvents: any[]
    ECollisionPosition: { x: number, y: number }
    currentDirectionRef: { current: string }
    playerDirection: { current: number }
    socket: Socket | null

    playerInventory: any[]; // 新たに追加
}

// const socket = io('http://localhost:5000'); // サーバーのURLを指定


const PlayerInventory: React.FC<PlayerInventoryProps> = ({
                                                             roomId, playerId, eCollisionGotItem, ECollisionPosition,
                                                             currentDirectionRef, craftEvents, socket, playerDirection,playerInventory
                                                         }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [playerItems, setPlayerItems] = useState<PlayerHaveItem[] | null>(null);
    // alert(JSON.stringify(playerItems))
    const [craftItems, setCraftItems] = useState<any[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    console.log(selectedItemId)
    const [selectItemIndex, setSelectItemIndex] = useState<number>(0);
    const [selectedCraftItemId, setSelectedCraftItemId] = useState<number | null>(null);
    const handleItemClick = (itemId: number) => {

        if (selectedItemId === itemId) {
            alert("どっちに来てるの１")
            setSelectedItemId(null);
        } else {
            alert("どっちに来てるの１あ")

            setSelectedItemId(itemId);
        }
    };

    // playerItemsが更新されたときにインデックス初期化
    useEffect(() => {
        if (playerItems && playerItems.length > 0) {
            setSelectItemIndex(0);
        }
    }, [playerItems]);
    // ホイールスクロールでアイテムを選択
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            if (isOpen) return; // クラフトメニューが開いていたら無視
            if (!playerItems || playerItems.length === 0) return;

            event.preventDefault();
            const currentIndex = playerItems.findIndex(item => item.itemId === selectedItemId);
            const newIndex =
                event.deltaY > 0
                    ? (currentIndex + 1) % playerItems.length
                    : (currentIndex - 1 + playerItems.length) % playerItems.length;

            setSelectedItemId(playerItems[newIndex].itemId);
        };

        window.addEventListener("wheel", handleWheel, {passive: false});
        return () => {
            window.removeEventListener("wheel", handleWheel);
        };
    }, [playerItems, selectedItemId, isOpen]);


    // const handleOutsideRightClick = (event) => {
    //     event.preventDefault(); // 右クリックのデフォルトメニューを防ぐ
    //     if (selectedItemId !== null) {
    //         console.log(selectedItemId)
    //         console.log(`アイテム置かれたがな: ${selectedItemId}`);
    //         // アイテムを配置するロジック
    //     }
    //     setSelectedItemId(null); // 配置後に選択を解除する
    // };

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'p' && selectedItemId !== null) {
                console.log(`アイテムを置いたよ: ${selectedItemId}`);
                // アイテムを配置するロジック
            }
        };

        const handleMouseDown = (event) => {
            if (event.button === 2 && selectedItemId !== null) {
                event.preventDefault(); // 右クリックのデフォルトメニューを防ぐ
                console.log(`アイテムを置いたよ!!!: ${selectedItemId}`);
                // 置かれたアイテムを保存するロジック
                const putItem = async () => {

                    const result = await fetch("/api/item/putItem", {
                        method: "POST",
                        headers: {"content-type": "application/json"},
                        body: JSON.stringify({
                            roomId,
                            selectedItemId,
                            playerDirection,
                            currentDirectionRef,
                            ECollisionPosition,
                            playerId
                        }),
                    })
                    if (result.ok && socket) {

                        const putItemData = await result.json()
                        console.log(putItemData.data)

                        const response = await updatePlayerItems(playerId.id);
                        if (response) {
                            const placedItem = response.item.find(item => item.itemId === selectedItemId);
                            setPlayerItems(response.item);
                            const stillHasItem = response.item.some(item => item.itemId === selectedItemId);
                            if (!placedItem || placedItem.quantity <= 0) {
                                // 他に所持しているアイテムがあれば最初のアイテムを選択、なければnull
                                const nextItem = response.item.find(item => item.quantity > 0);
                                setSelectedItemId(nextItem ? nextItem.itemId : null);
                            }
                        }
                        const itemData = {
                            roomId,
                            placedByPlayer : selectedItemId,
                            playerDirection,
                            playerId : playerId.id,
                            currentDirectionRef,
                            ECollisionPosition,
                            itemId : putItemData.data.itemId,
                            id: putItemData?.data?.id,
                            x: putItemData.data.x,
                            y: putItemData.data.y,
                            width: putItemData.data.width,
                            height: putItemData.data.height,
                            iconImage: putItemData.data.iconImage,
                        };
                        // サーバーにアイテム配置を通知
                        socket.emit('placeItem', itemData);
                    }
                }
                putItem()
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('mousedown', handleMouseDown);

        // クリーンアップ関数
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [selectedItemId, ECollisionPosition]);

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

    const handleCraftClick = () => {
        if (selectedItemId) {
            alert(selectedItemId)
            const selectedItem = craftItems.find(
                (item) => item.id === Number(selectedItemId)
            );
            handleCraftItem(Number(selectedItemId));
            if (selectedItem) {
                toast.success(`${selectedItem.createdItem.itemName} を獲得した！`);
            }
        }
    };


    const ItemBreak = async (playerId: number | undefined) => {

        const player = await prisma.playerData.findUnique({
            where: {playerId},
            include: {haveItems: true}, // プレイヤーの所持アイテムも取得
        });
        if (!player) {
            throw new Error("プレイヤーが見つかりません");
        }

    }

    return (

        <>
            <div className={styles.inventoryUnder}>
                {playerItems?.map((item, index) => (
                    item.quantity > 0 && (<div
                        key={item.id}
                        className={`${styles.inventoryUnderItem} ${selectedItemId === item.itemId ? styles.inventorySelected : ''}`}
                        onClick={() => handleItemClick(item.itemId)}
                    >

                        <Image
                            src={item.DefaultItemList.itemIcon[0] || ""}
                            alt={item.DefaultItemList.itemName}
                            width={40}
                            height={40}
                        />
                        <span className={styles.inventoryItemUnderQuantity}>{item.quantity}</span>
                    </div>)
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
                                <div className={styles.inventoryGrid}>
                                    {playerItems?.map((item) => (
                                        item.quantity > 0 && (
                                            <div key={item.id} className={styles.inventoryItemGrid}>
                                                <Image
                                                    src={item.DefaultItemList.itemIcon[0] || ""}
                                                    alt={item.DefaultItemList.itemName}
                                                    width={48}
                                                    height={48}
                                                    title={`${item.DefaultItemList.itemName} ×${item.quantity}`}
                                                />
                                                <span className={styles.quantityOverlay}>{item.quantity}</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                            <div className={styles.crafting}>
                                <h3 className={styles.heading}>クラフトメニュー</h3>

                                <p className={styles.selectedInfo}>
                                    選択中: {selectedCraftItemId || '-- アイテムを選択 --'}
                                </p>

                                <div className={styles.craftButtonContainer}>
                                    {craftItems.map((craftItem) => (
                                        <div
                                            className={`${styles.craftButtons} ${selectedCraftItemId === craftItem.createdItem.id ? styles.selected : ''}`}
                                            key={craftItem.id}
                                            onClick={() => setSelectedItemId(craftItem.id)}
                                        >
                                            <span className={styles.itemName}>{craftItem.createdItem.id}</span>
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

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
}

// const socket = io('http://localhost:5000'); // サーバーのURLを指定


const PlayerInventory: React.FC<PlayerInventoryProps> = ({
                                                             roomId, playerId, eCollisionGotItem, ECollisionPosition,
                                                             currentDirectionRef, craftEvents, socket, playerDirection
                                                         }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [playerItems, setPlayerItems] = useState<PlayerHaveItem[] | null>(null);
    const [craftItems, setCraftItems] = useState<any[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [putItem, setPutItem] = useState<number>(0)
    const handleItemClick = (itemId) => {
        if (selectedItemId === itemId) {
            console.log(`Place item with ID: ${selectedItemId}`);
            // アイテムを配置するロジック
            setSelectedItemId(null); // 配置後に選択を解除する
        } else {
            setSelectedItemId(itemId);
        }
    };

    useEffect(() => {
        socket?.on('itemPlaced', (itemData) => {
            console.log('New item placed:', itemData);
            // 新しいアイテムをマップに追加
        });

        return () => {
            socket?.off('itemPlaced');
        };
    }, []);


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
        console.log("ECollisionPosition updated:", ECollisionPosition);
    }, [ECollisionPosition]);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'p' && selectedItemId !== null) {
                console.log(`アイテムを置いたよ: ${selectedItemId}`);　
                // アイテムを配置するロジック
                setSelectedItemId(null); // 配置後に選択を解除する
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
                            setPlayerItems(response.item);
                        }
                        const itemData = {
                            roomId,
                            selectedItemId,
                            playerDirection,
                            currentDirectionRef,
                            ECollisionPosition,
                            id: putItemData.data.id,
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
    // →取得したアイテムのキーを消すイメージ。
    // storageに保存されている前提。　→　画像を置かれている座標と保存することで取得されるたびにランダムに座標を生成する必要がある。

    // ユーザーがアイテムを獲得した状態をどのようにして新しい関数に入れていけばいいかわからない
    // アイテムの関数に取得したアイテムIdをキーから割り出して、プレイヤーIDも持ってくきてそれを渡す必要

    // ランダムに動くアイテムの座標をどのようにして使うのか
    // →publicフォルダー画像を呼び出してその画像をランダムに座標を生成してるから配置してるから座標を扱うのは無理。

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

    return (

        <>
            <div className={styles.inventoryUnder}>
                {playerItems?.map((item ,index) => (
                    item.quantity > 0 && (<div
                        key={item.id}
                        className={`${styles.inventoryUnderItem} ${selectedItemId === item.itemId ? styles.inventorySelected : ''}`}
                        onClick={() => handleItemClick(item.itemId)}
                    >

                        <Image
                            src={item.DefaultItemList.itemIcon || ""}
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

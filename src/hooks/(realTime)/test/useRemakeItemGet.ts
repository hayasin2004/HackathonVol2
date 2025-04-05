"use client";
import {useState, useEffect, useRef, useCallback} from "react";
import {defaultItem} from "@/types/defaultItem";
import {playerGetItem} from "@/app/api/(realtime)/item/getItem/route";

export interface MapObject {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isMapObject: boolean;
    relatedItemId: string;
}


interface UseGetItemProps {
    userId?: number;
    // initialPosition は null/undefined を許容しない方が扱いやすい
    initialPosition: { x: number; y: number };
    circleRadius?: number;
    rectPositions?: Array<defaultItem> | null;
    speed?: number;
    mapWidthInPixels?: number; // マップの幅 (ピクセル単位) を受け取る
    mapHeightInPixels?: number; // マップの高さ (ピクセル単位) を受け取る
    mapObjects?: MapObject[];  // 追加: マップオブジェクト配列
}

const TILE_SIZE = 64;
const DEFAULT_MOVE_INTERVAL = 150; // 移動間隔 (ミリ秒)

export const useRemakeItemGet = ({
                                     userId,
                                     initialPosition,
                                     circleRadius = 0,
                                     rectPositions,
                                     speed,
                                     mapWidthInPixels,
                                     mapHeightInPixels,
                                     mapObjects = []  // マップオブジェクト情報を受け取る
                                 }: UseGetItemProps) => {
    const [ECollisionPosition, setECollisionPosition] = useState(initialPosition);
    const [adjacentObstacles, setAdjacentObstacles] = useState<defaultItem[] | null>(null);
    const [adjacentMapObjects, setAdjacentMapObjects] = useState<MapObject[] | null>(null);
    const [ePressCount, setEPressCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ECollisionStatus, setECollisionStatus] = useState(false);

    const eKeyPressedRef = useRef(false);
    const keysPressedRef = useRef({
        ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    });
    const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const moveInterval = speed ? Math.max(50, 400 - speed) : DEFAULT_MOVE_INTERVAL;

    // アイテム生成・保存関数
    const createItemFromMapObject = async (mapObject: MapObject) => {
        try {
            // 生成するアイテムのデータ
            const newItem: defaultItem = {
                id: mapObject.relatedItemId,
                x: ECollisionPosition.x,
                y: ECollisionPosition.y,
                userId: userId
            };


            // ここでSupabaseにアイテムを保存するロジックを呼び出し
            // saveItemToDatabase(newItem);　
            let itemId = [];

            if (mapObject.type === "tree") {
                itemId = [1];
            } else if (mapObject.type === "stone") {
                itemId = [2];
            } else if (mapObject.type === "coal") {
                itemId = [3];
            } else if (mapObject.type === "iron") {
                itemId = [4];
            } else if (mapObject.type === "flower") {
                itemId = [3];
            } else if (mapObject.type === "mushroom") {
                itemId = [8];
            } else if (mapObject.type === "insect") {
                itemId = [10];
            } else if (mapObject.type === "water") {
                itemId = [11];
            } else {
                console.log(`${mapObject.type}は未対応のタイプです`);
                return null;
            }


            if (itemId) {
                console.log(mapObject.type);
                const result = await playerGetItem(userId, itemId);
                if (result?.status === "success" && result.savedItem) {
                    console.log("koko")
                    console.log("Item acquisition success:", result.savedItem)
                }
            }
            return newItem;
        } catch (error) {
            console.error("アイテム生成エラー:", error);
            return null;
        }
    };


    // 衝突判定関数 (変更なし)
    const getCollidingObstacles = useCallback((playerX: number, playerY: number): defaultItem[] => {
        // ... (元のロジック) ...
        if (!rectPositions || rectPositions.length === 0) return [];

        const playerTileX = Math.floor(playerX / TILE_SIZE);
        const playerTileY = Math.floor(playerY / TILE_SIZE);

        const colliding = rectPositions.filter((rect) => {
            if (rect.x == null || rect.y == null || !rect.width || !rect.height) {
                return false;
            }
            const itemCenterX = rect.x + rect.width / 2;
            const itemCenterY = rect.y + rect.height / 2;
            const itemTileX = Math.floor(itemCenterX / TILE_SIZE);
            const itemTileY = Math.floor(itemCenterY / TILE_SIZE);

            const isAdjacent =
                Math.abs(itemTileX - playerTileX) <= 1 &&
                Math.abs(itemTileY - playerTileY) <= 1;

            return isAdjacent;
        });
        return colliding;
    }, [rectPositions]);

    // Eキー処理 (変更なし)
    const handleEKeyPress = useCallback(() => {
        if (isProcessing) return;
        setIsProcessing(true);
        console.log(rectPositions)
        // 1. 近くのアイテム（既存の素材アイテム）をチェック
        const nearbyItems = rectPositions!.filter(item => {
            const distance = Math.sqrt(
                Math.pow((item.x || 0) - ECollisionPosition.x, 2) +
                Math.pow((item.y || 0) - ECollisionPosition.y, 2)
            );
            return distance < TILE_SIZE * 1.5; // 近接判定の距離
        });

        // 2. 近くのマップオブジェクトをチェック
        const nearbyMapObjects = mapObjects.filter(obj => {
            // オブジェクトの中心点を計算
            const objCenterX = obj.x + obj.width / 2;
            const objCenterY = obj.y + obj.height / 2;

            const distance = Math.sqrt(
                Math.pow(objCenterX - ECollisionPosition.x, 2) +
                Math.pow(objCenterY - ECollisionPosition.y, 2)
            );

            // オブジェクトの大きさに応じて判定距離を調整
            const interactionDistance = obj.width > TILE_SIZE ? TILE_SIZE * 2 : TILE_SIZE * 1.5;
            return distance < interactionDistance;
        });

        // 3. 処理の優先順位付け
        if (nearbyItems.length > 0) {
            // 既存のアイテム取得処理
            setAdjacentObstacles(nearbyItems);
            // 既存のアイテム取得ロジック呼び出し
            // ...
        } else if (nearbyMapObjects.length > 0) {
            // 近くのマップオブジェクトを記録
            setAdjacentMapObjects(nearbyMapObjects);

            // 最も近いオブジェクトを取得
            const closestObject = nearbyMapObjects[0];
            console.log(closestObject)
            // オブジェクトからアイテムを生成して保存
            createItemFromMapObject(closestObject).then(newItem => {
                if (newItem) {
                    // 成功したら既存のitemDataに追加するための処理を呼び出し
                    // addItemToInventory(newItem);

                    // オプション: マップからオブジェクトを消す処理
                    // removeMapObject(closestObject);
                }
            });
        }

        setIsProcessing(false);
    }, [ECollisionPosition, rectPositions, mapObjects, userId, isProcessing]);

    // --- 移動処理のコアロジック ---
    const updatePosition = useCallback(() => {
        setECollisionPosition((prev) => {
            let newX = prev.x;
            let newY = prev.y;
            const moveAmount = TILE_SIZE;

            if (keysPressedRef.current.ArrowUp) newY -= moveAmount;
            if (keysPressedRef.current.ArrowDown) newY += moveAmount;
            if (keysPressedRef.current.ArrowLeft) newX -= moveAmount;
            if (keysPressedRef.current.ArrowRight) newX += moveAmount;

            // --- 境界チェック: マップ境界を使用 ---
            const minX = 0;
            const minY = 0;
            // マップサイズが指定されていなければ Infinity を使う (実質境界なし)
            // プレイヤーの右端・下端がマップの端を超えないように TILE_SIZE を引く
            const maxX = mapWidthInPixels !== undefined ? mapWidthInPixels - TILE_SIZE : Infinity;
            const maxY = mapHeightInPixels !== undefined ? mapHeightInPixels - TILE_SIZE : Infinity;

            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));
            // --- 境界チェックここまで ---

            if (newX !== prev.x || newY !== prev.y) {
                return {x: newX, y: newY};
            }
            return prev; // 位置が変わらない場合は再レンダリングをスキップ
        });
    }, [mapWidthInPixels, mapHeightInPixels]); // 依存配列にマップサイズを追加

    // --- 移動インターバルの管理 ---
    const startMoving = useCallback(() => {
        if (moveIntervalRef.current) return; // 既に実行中なら何もしない
        console.log("Starting movement interval"); // デバッグログ
        updatePosition(); // 最初に1回即時実行
        moveIntervalRef.current = setInterval(updatePosition, moveInterval);
    }, [updatePosition, moveInterval]);

    const stopMoving = useCallback(() => {
        if (moveIntervalRef.current) {
            console.log("Stopping movement interval"); // デバッグログ
            clearInterval(moveIntervalRef.current);
            moveIntervalRef.current = null;
        }
    }, []);

    // --- キー入力イベントリスナー ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;
            // console.log("Key Down:", key); // デバッグ

            if (key === "e" || key === "E") {
                if (!eKeyPressedRef.current) {
                    eKeyPressedRef.current = true;
                    setEPressCount((prevCount) => prevCount + 1);
                    handleEKeyPress();
                }
                return; // Eキーなら以降の移動処理はしない
            }

            if (key in keysPressedRef.current) {
                e.preventDefault(); // デフォルトのスクロール等を防ぐ
                const directionKey = key as keyof typeof keysPressedRef.current;
                // キーがまだ押されていない状態だったら、状態を true にして移動開始
                if (!keysPressedRef.current[directionKey]) {
                    keysPressedRef.current[directionKey] = true;
                    // 他のキーが押されているかどうかにかかわらず、startMoving を呼ぶ
                    // (startMoving内で既に動いているかチェックしているので問題ない)
                    startMoving();
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key;
            // console.log("Key Up:", key); // デバッグ

            if (key === "e" || key === "E") {
                eKeyPressedRef.current = false;
                return;
            }

            if (key in keysPressedRef.current) {
                e.preventDefault();
                const directionKey = key as keyof typeof keysPressedRef.current;
                keysPressedRef.current[directionKey] = false; // キーを離した状態にする

                // 他に押されている矢印キーがあるかチェック
                const anyArrowKeyPressed = Object.values(keysPressedRef.current).some(pressed => pressed);

                // どの矢印キーも押されていなければ、移動インターバルを停止
                if (!anyArrowKeyPressed) {
                    stopMoving();
                }
                // 他のキーがまだ押されていれば stopMoving は呼ばれず、移動は継続される
            }
        };

        // イベントリスナーを document に登録 (特定の要素にフォーカス不要)
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        // クリーンアップ関数
        return () => {
            console.log("Removing key listeners and stopping movement"); // デバッグログ
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            stopMoving(); // コンポーネントアンマウント時にインターバルをクリア
        };
    }, [handleEKeyPress, startMoving, stopMoving]); // 依存配列

    // 位置更新時の衝突状態判定 (変更なし)
    useEffect(() => {
        if (ECollisionPosition.x != null && ECollisionPosition.y != null) {
            const collidingObstacles = getCollidingObstacles(ECollisionPosition.x, ECollisionPosition.y);
            const hasCollision = collidingObstacles.length > 0;

            // 1. ECollisionStatus の更新 (関数形式で前の状態と比較)
            setECollisionStatus(prevStatus => {
                // 状態が実際に変化する場合のみ新しい値を返す
                if (prevStatus !== hasCollision) {
                    return hasCollision;
                }
                // 変化がなければ、前の状態を維持 (再レンダリングを抑制)
                return prevStatus;
            });

            // 2. adjacentObstacles の更新 (関数形式で前の状態と比較)
            setAdjacentObstacles(prevObstacles => {
                const newObstacles = hasCollision ? collidingObstacles : null;

                // 厳密な比較が必要な場合があるが、ここではシンプルにnullチェックとlengthで比較
                // （配列の中身まで比較するとコストがかかる）
                // 目的: 不要な場合に同じ参照を返して再レンダリングを抑制する
                const noChange =
                    (prevObstacles === null && newObstacles === null) ||
                    (prevObstacles !== null && newObstacles !== null && prevObstacles.length === newObstacles.length &&
                        // 必要ならさらに要素ごとのID比較などを行う
                        prevObstacles.every((item, index) => item.id === newObstacles[index]?.id)); // 例: IDで比較

                if (noChange) {
                    // 変化がない場合は前の状態を返す
                    return prevObstacles;
                } else {
                    // 変化がある場合は新しい配列 (または null) を返す
                    // [...collidingObstacles] で常に新しい参照を作る
                    return hasCollision ? [...collidingObstacles] : null;
                }
            });

        } else {
            // 位置が無効なら両方クリア (ここでも関数形式を使うとより安全)
            setECollisionStatus(prev => prev ? false : prev); // falseでなければfalseにする
            setAdjacentObstacles(prev => prev !== null ? null : prev); // nullでなければnullにする
        }
// 依存配列は ECollisionPosition と getCollidingObstacles のまま
    }, [ECollisionPosition, getCollidingObstacles]);


    return {
        ECollisionPosition,
        ECollisionStatus,
        adjacentObstacles,
        adjacentMapObjects, // 新しく追加
        ePressCount,
        handleEKeyPress    // 外部から呼び出せるように
    };
};

export default useRemakeItemGet;
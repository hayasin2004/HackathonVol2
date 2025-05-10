// src/components/(konva)/enemy/EnemyTest.tsx
"use client"
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Stage, Layer, Group, Image, Text} from "react-konva";
import useImage from "use-image";
import {Enemy} from "@/types/enemy";
import useEnemyRandomMovement from "@/hooks/(animation)/enemy/randomEnemy/useEnemyRandomMovement";
import useEnemyLinearRandomMovement from "@/hooks/(animation)/enemy/linearEnemy/useEnemyLinearRandomMovement";
import {PlayerItem} from "@/types/playerItem";
import {Socket} from "socket.io-client";
import useEnemyBuruBuruMovement from "@/hooks/(animation)/enemy/EnemyBuruBuru/useEnemyBuruBuruMovement";
import DialogueBox from "@/components/(konva)/npc/DialogueBox";
import {QuestType} from "@/types/quest";
import {number} from "prop-types";
import {toast} from "react-toastify";


interface PropsNpcData {
    enemyData: Enemy[] | null
    cameraPosition: { x: number, y: number }
    ECollisionPosition: { x: number, y: number }
    onEnemyRemove?: (enemyId: number) => void
    playerAttack: number
    player?: PlayerItem
    onPlayerDamage?: (newHp: number) => void
    socket: Socket | null
    onDialogOpen?: (isOpen: boolean) => void  // 追加: ダイアログの状態を親に通知
    activeQuest?: QuestType // クエスト情報があれば
    onAlert?: () => void; // 新たに追加
    onNextQuest?: (currentQuestId: number) => void;
}

const currentStage = 1;

const onInteract = (enemy: Enemy, dialogue: any) => {
    console.log("NPCと対話:", enemy.name, dialogue);
};

const EnemyTest: React.FC<PropsNpcData> = ({
                                               enemyData, onAlert, cameraPosition, player, socket,
                                               onPlayerDamage, onEnemyRemove, ECollisionPosition, playerAttack,
                                               onDialogOpen, activeQuest, onNextQuest
                                           }) => {
    const [dialogue, setDialogue] = useState<string | null>(null);
    const [globalMouseDown, setGlobalMouseDown] = useState(false);

    const [playerHP, setPlayerHP] = useState<number>(player?.hp || 100);
    const [isPlayerAlive, setIsPlayerAlive] = useState(true);
    const [visibleEnemies, setVisibleEnemies] = useState<Enemy[]>([]);
    const [currentDialogue, setCurrentDialogue] = useState<string | null>(null); // 現在のダイアログ内容を管理

    // ダイアログが開いているかどうかの状態
// 修正: activeDialogue の型定義を更新
    const [activeDialogue, setActiveDialogue] = useState<{
        isVisible: boolean;
        enemy: (Enemy & { dialogues: string | any[] }) | null; // dialogues プロパティを考慮
        currentIndex?: number;
    }>({
        isVisible: false,
        enemy: null,
        currentIndex: 0,
    });
    useEffect(() => {
        if (enemyData) {
            setVisibleEnemies(enemyData);
        }
    }, [enemyData]);
    useEffect(() => {
        if (player) {
            setPlayerHP(player.hp);
        }
    }, [player]);

    // グローバルなマウスダウンイベントを監視
    useEffect(() => {
        const handleGlobalMouseDown = (e: MouseEvent) => {
            if (e.button === 0) { // 左クリックの場合
                setGlobalMouseDown(true);

                // 少し遅延を入れてフラグをリセット
                setTimeout(() => {
                    setGlobalMouseDown(false);
                }, 100);
            }
        };

        window.addEventListener('mousedown', handleGlobalMouseDown);
        return () => {
            window.removeEventListener('mousedown', handleGlobalMouseDown);
        };
    }, []);
    const [totalEnemiesDefeated, setTotalEnemiesDefeated] = useState(0);

    const handleRemoveEnemy = (enemyId: number) => {
        console.log(`敵ID: ${enemyId} を削除します`);

        // ローカルストレージに削除された敵IDを保存
        const defeatedEnemies = JSON.parse(localStorage.getItem("defeatedEnemies") || "[]");
        if (!defeatedEnemies.includes(enemyId)) {
            defeatedEnemies.push(enemyId);
            localStorage.setItem("defeatedEnemies", JSON.stringify(defeatedEnemies));
        }

        // 倒した敵のカウントを増やす
        setTotalEnemiesDefeated((prevCount) => {
            const newCount = prevCount + 1;
            console.log(`現在までに倒した敵の合計数: ${newCount}`);

            // 4体倒したらアラートを表示
            if (newCount === 4 && onNextQuest) {
                onNextQuest(3); // 現在のクエストIDを渡す
                localStorage.setItem("quest3Complete", "サクラと話そう")
                alert("4体の敵を倒しました！");
            }

            return newCount;
        });

        // 親コンポーネントに通知（もし関数が提供されていれば）
        if (onEnemyRemove) {
            onEnemyRemove(enemyId);
        }

        // ローカルの状態を更新して敵を削除
        setVisibleEnemies((prev) => prev.filter((enemy) => enemy.id !== enemyId));
    };
    // もし他のプレイヤーが敵を倒したときの通知
    // ソケットイベントで敵削除を受信
    useEffect(() => {
        if (!socket) return;

        const handleEnemyRemoved = (removedEnemy: Enemy) => {
            console.log(removedEnemy.id);
            alert(`敵ID ${removedEnemy.name} が倒された！`);

            // 正しい敵IDを使って削除
            setVisibleEnemies((prev) => prev.filter((enemy) => enemy.id !== removedEnemy.id));
        };

        socket.on("enemyRemoved", handleEnemyRemoved);

        return () => {
            socket.off("enemyRemoved", handleEnemyRemoved);
        };
    }, [socket]);


    // 敵にダメージを与える関数
    const damageEnemy = useCallback((enemy: Enemy, attackPower: number) => {

        const newHp = enemy.hp - attackPower;
        console.log(`${enemy.name}に${attackPower}ダメージ！残りHP: ${newHp}`);
        console.log(enemy.hp, attackPower);

        if (newHp <= 0) {
            // HPが0以下になったら敵を削除
            handleRemoveEnemy(enemy.id);

            // サーバーに削除イベントを送信
            if (socket) {
                socket.emit("removeEnemy", enemy);
            }
            return true; // 敵が倒されたことを示す
        }

        // HPが残っている場合は敵のHPを更新
        const updatedEnemy = {...enemy, hp: newHp};
        console.log("updatedEnemy" + JSON.stringify(updatedEnemy))
        setVisibleEnemies(prev =>
            prev.map(e => e.id === enemy.id ? updatedEnemy : e)
        );
        return false; // 敵はまだ生きている
    }, [handleRemoveEnemy, playerAttack, socket]);


    // プレイヤーにダメージを与える関数
    const damagePlayer = useCallback((attackPower: number) => {
        if (!isPlayerAlive) return; // プレイヤーが既に死亡している場合は何もしない

        const newHP = playerHP - attackPower;
        console.log(`プレイヤーに${attackPower}ダメージ！残りHP: ${newHP}`);

        if (newHP < 0) {
            // HPが0以下になったらプレイヤーを「死亡」状態に
            setIsPlayerAlive(false);
            setPlayerHP(0);

            if (onPlayerDamage) {
                onPlayerDamage(0);
            }

            console.log("プレイヤーが倒れました！");
            // ここでゲームオーバー処理を追加できます
            alert("ゲームオーバー！プレイヤーが倒れました。");
        } else {
            // HPを更新
            setPlayerHP(newHP);

            if (onPlayerDamage) {
                onPlayerDamage(newHP);
            }
        }
    }, [playerHP, onPlayerDamage, isPlayerAlive]);
    // プレイヤーが死亡している場合、ゲームオーバー表示
    const [questProgress, setQuestProgress] = useState(0);
    useEffect(() => {
        try {
            const questCurrent = localStorage.getItem("npcDialogueStates")
            if (questCurrent) {
                const parsedData = JSON.parse(questCurrent); // JSONをパース
                const npc3Data = parsedData["3"]; // NPC IDが3のデータを取得

                if (parsedData[3]?.progress === "Aiと話そう") {
                    setQuestProgress(1);
                    console.log("話しましょう");
                } else {
                    setQuestProgress(0);
                    console.log("他の状態です");
                }
            }

        } catch (error) {
            console.error("ローカルストレージからデータを取得・解析中にエラーが発生しました:", error);
        }
    }, [activeQuest]);

    useEffect(() => {
        let followPlayerInterval: NodeJS.Timeout | null = null;

        if (activeQuest?.quest.id === 5) {
            console.log("クエストID 5: 敵がプレイヤーを追尾します");

            followPlayerInterval = setInterval(() => {
                setVisibleEnemies((prevEnemies) =>
                    prevEnemies.map((enemy) => {
                        // プレイヤーの位置を取得
                        const playerX = ECollisionPosition.x;
                        const playerY = ECollisionPosition.y;

                        // 敵の現在位置
                        const enemyX = enemy.x;
                        const enemyY = enemy.y;

                        // プレイヤーに向かう方向を計算
                        const dx = playerX - enemyX;
                        const dy = playerY - enemyY;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        // 移動速度を設定 (1フレームあたりの移動量)
                        const speed = 5;

                        // 距離が0でない場合に移動
                        if (distance > 0) {
                            const moveX = (dx / distance) * speed;
                            const moveY = (dy / distance) * speed;

                            // 敵の位置を更新
                            return {
                                ...enemy,
                                x: enemyX + moveX,
                                y: enemyY + moveY,
                            };
                        }

                        return enemy; // 距離が0の場合はそのまま
                    })
                );
            }, 0.3); // 100msごとに更新
        }

        return () => {
            if (followPlayerInterval) {
                clearInterval(followPlayerInterval); // クリーンアップ時にインターバルを解除
            }
        };
    }, [activeQuest?.quest.id, ECollisionPosition]);
    ;
    ;

    useEffect(() => {
        // ローカルストレージから敵の座標を取得
        const storedPositions = localStorage.getItem("enemyPositions");
        if (storedPositions) {
            try {
                const parsedPositions = JSON.parse(storedPositions);
                setVisibleEnemies(parsedPositions);
            } catch (error) {
                console.error("ローカルストレージから敵の座標を読み込む際にエラーが発生しました:", error);
            }
        } else if (enemyData) {
            // ローカルストレージにデータがない場合は、初期データを使用
            setVisibleEnemies(enemyData);
        }
    }, [enemyData]);

// isVisibleだけを抽出して依存配列に使用
    const isDialogVisible = activeDialogue.isVisible;

// 状態変更を通知するuseEffect
    const prevVisibleRef = useRef<boolean>(activeDialogue.isVisible);

    useEffect(() => {
        if (onDialogOpen && prevVisibleRef.current !== activeDialogue.isVisible) {
            console.log("[EnemyTest] ダイアログ状態変更:", activeDialogue.isVisible);
            onDialogOpen(activeDialogue.isVisible);
            prevVisibleRef.current = activeDialogue.isVisible;
        }
    }, [activeDialogue.isVisible, onDialogOpen]);
    if (!isPlayerAlive) {
        console.log("死亡しました。ゲームオーバーです。")
    }

    const handleOpenDialogue = (enemy: Enemy, position: { x: number; y: number }) => {
        console.log("[EnemyTest] ダイアログを開く処理開始:", enemy.name);

        const enemyDialogues = typeof enemy.dialogues === "string" ? JSON.parse(enemy.dialogues) : enemy.dialogues;

        const enemyWithDialogues = {
            ...enemy,
            dialogues: Array.isArray(enemyDialogues) ? enemyDialogues : [],
        };

        // ダイアログ内容を計算
        const calculateDialogue = () => {
            if (isQuestActive && enemy.id >= 7 && enemy.id <= 10) {
                // クエスト中は 2 番目以降のダイアログを表示
                if (Array.isArray(enemyWithDialogues.dialogues) && enemyWithDialogues.dialogues.length > 2) {
                    return enemyWithDialogues.dialogues[2];
                }
                return "…"; // ダイアログがない場合のデフォルト
            }

            // 通常時は 1 番目のダイアログを表示
            if (Array.isArray(enemyWithDialogues.dialogues) && enemyWithDialogues.dialogues.length > 1) {
                return enemyWithDialogues.dialogues[1];
            }

            return ""; // デフォルトで空文字列を返す
        };

        // ダイアログ位置と内容を更新
        setCurrentDialogue(calculateDialogue());

        setActiveDialogue({
            isVisible: true,
            enemy: enemyWithDialogues,
            currentIndex: isQuestActive && enemy.id >= 7 && enemy.id <= 10 ? 2 : 1, // クエスト中は 2 番目から開始
        });
    };// ダイアログを閉じる処理
    const handleCloseDialogue = () => {
        console.log("[EnemyTest] ダイアログを閉じる処理開始");

        // ダイアログが閉じられる際に条件をチェック
        if (questProgress === 1 && activeDialogue.enemy?.id === 10) {
            console.log("[EnemyTest] 10番の敵に話しかけたので7～10の敵を移動させます");

            // 7～10の敵を一斉に移動させる
            setVisibleEnemies((prevEnemies) => {
                const updatedEnemies = prevEnemies.map((enemy) => {
                    if (enemy.id >= 7 && enemy.id <= 10) {
                        switch (enemy.id) {
                            case 7:
                                return {...enemy, x: 1600, y: 704, progress: "みどりと話そう"}; // progress を追加
                            case 8:
                                return {...enemy, x: 576, y: 896, progress: "みどりと話そう"}; // progress を追加
                            case 9:
                                return {...enemy, x: 1152, y: 128, progress: "みどりと話そう"}; // progress を追加
                            case 10:
                                return {...enemy, x: 448, y: 512, progress: "みどりと話そう"}; // progress を追加
                            default:
                                return enemy;
                        }
                    }
                    return enemy;
                });

// ローカルストレージに保存
                localStorage.setItem("enemyPositions", JSON.stringify(updatedEnemies));

// クエストの進行を更新する場合
                if (onNextQuest) {
                    onNextQuest(1); // 現在のクエストIDを渡す
                }


                return updatedEnemies;
            });
        }
        setActiveDialogue(prev => {
            if (!prev.isVisible) {
                return prev;
            }
            return {
                isVisible: false,
                enemy: null,
                currentIndex: 0,
            };
        });
    };
    const handleNextDialogue = () => {
        if (activeDialogue.enemy && Array.isArray(activeDialogue.enemy.dialogues)) {
            const nextIndex = activeDialogue.currentIndex + 1;
            if (nextIndex < activeDialogue.enemy.dialogues.length) {
                setActiveDialogue((prev) => ({
                    ...prev,
                    currentIndex: nextIndex,
                }));
            }
        }
    };

    const handlePrevDialogue = () => {
        if (activeDialogue.enemy && Array.isArray(activeDialogue.enemy.dialogues)) {
            const prevIndex = activeDialogue.currentIndex - 1;
            if (prevIndex >= 0) {
                setActiveDialogue((prev) => ({
                    ...prev,
                    currentIndex: prevIndex,
                }));
            }
        }
    };
    // クエスト中かどうかを管理する状態
    const [isQuestActive, setIsQuestActive] = useState<boolean>(false);
    // プレイヤーのクエスト状況
    useEffect(() => {
        if (activeQuest?.complete == false) {
            setIsQuestActive(true); // クエストがアクティブになる
        } else {
            setIsQuestActive(false); // クエストが終了したら非アクティブにする
        }
    }, [activeQuest]);


    if (!visibleEnemies || visibleEnemies.length === 0) {
        return null;
    }
    return (
        <>
            {visibleEnemies?.map((enemy) => (
                <SingleEnemy
                    key={enemy?.id}
                    cameraPosition={cameraPosition}
                    enemy={enemy}
                    setDialogue={setDialogue}
                    ECollisionPosition={ECollisionPosition}
                    globalMouseDown={globalMouseDown}
                    damageEnemy={damageEnemy}
                    onEnemyRemove={handleRemoveEnemy}
                    damagePlayer={damagePlayer}
                    playerAttack={playerAttack}
                    playerHP={playerHP}
                    openDialogue={handleOpenDialogue}
                    isQuestActive={isQuestActive}
                    questProgress={questProgress}
                    activeQuest={activeQuest}
                />
            ))}
            <DialogueBox
                activeDialogue={{
                    isVisible: activeDialogue.isVisible,
                    npc: activeDialogue.enemy,
                    currentIndex: activeDialogue.currentIndex,
                }}
                dialogueContent={currentDialogue}
                onClose={handleCloseDialogue}
                onNextDialogue={handleNextDialogue}
                onPrevDialogue={handlePrevDialogue}
            />
        </>
    );
};

const SingleEnemy: React.FC<{
    enemy: Enemy,
    cameraPosition: { x: number, y: number },
    setDialogue: React.Dispatch<React.SetStateAction<string | null>>,
    ECollisionPosition: { x: number, y: number },
    globalMouseDown: boolean,
    damagePlayer: (attackPower: number) => void,
    onEnemyRemove: (enemyId: number) => void,
    damageEnemy: (enemy: Enemy, attackPower: number) => boolean,
    playerAttack: number,
    playerHP?: number,
    isQuestActive: boolean,
    openDialogue: (enemy: Enemy) => void,
    questProgress: number,
    activeQuest?: QuestType
}> = ({
          enemy,
          cameraPosition,
          damageEnemy,
          questProgress,
          openDialogue,
          damagePlayer,
          isQuestActive,
          ECollisionPosition,
          playerHP,
          globalMouseDown,
          playerAttack,
          activeQuest
      }) => {
    const imageIndex = 1;
    const validImageIndex = Array.isArray(enemy.images) && enemy.images.length > imageIndex ? imageIndex : 0;
    const [image] = useImage(Array.isArray(enemy.images) ? enemy.images[validImageIndex] : undefined);

    const [isColliding, setIsColliding] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false); // ゲームオーバーフラグを追加

    // すべての動きのフックを呼び出す
    const randomMovement = useEnemyRandomMovement(enemy?.x, enemy?.y);
    const linearMovement = useEnemyLinearRandomMovement(enemy?.x, enemy?.y);
    const buruburuMovement = useEnemyBuruBuruMovement(enemy?.x, enemy?.y);
    const [lastAttackTime, setLastAttackTime] = useState(0);
    const attackCooldown = 500; // プレイヤーの攻撃クールダウン時間（ミリ秒）

    // ポジションとダイアログの表示状態を決定
    let position: { x: number, y: number } = {x: enemy?.x, y: enemy?.y};
    let showDialog = false;

    const [questFillProgress, setQuestFillProgress] = useState(0)


    useEffect(() => {
        const questCurrent = localStorage.getItem("npcDialogueStates");

        if (questCurrent) {

            const parsedData = JSON.parse(questCurrent); // JSONをパース
            const npc3Data = parsedData["3"]; // NPC IDが3のデータを取得
            if (parsedData?.progress === "Aiと話そう") {
                alert("09876")
                setQuestFillProgress(1);
                console.log("話しましょう");
            } else {
                setQuestFillProgress(0);
                console.log("他の状態です");
            }
        } else {
            setQuestFillProgress(0)
            return;
            ;
        }

    }, [questProgress]);

    if (activeQuest?.quest.id === 5) {
        // プレイヤーを追尾するロジック
        const playerX = ECollisionPosition.x;
        const playerY = ECollisionPosition.y;

        const enemyX = enemy.x;
        const enemyY = enemy.y;

        const dx = playerX - enemyX;
        const dy = playerY - enemyY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const speed = 50; // 移動速度

        if (distance > 0) {
            // 移動量を計算
            const moveX = (dx / distance) * speed;
            const moveY = (dy / distance) * speed;

            // 新しい位置を計算（64px単位でスナップ）
            const newX = Math.round((enemyX + moveX) / 64) * 64;
            const newY = Math.round((enemyY + moveY) / 64) * 64;

            position = {
                x: newX,
                y: newY,
            };
        }
        showDialog = false;
    } else if (enemy.movementPattern.type === "random") {
        position = randomMovement.position;
        showDialog = randomMovement.showDialog;
    } else if (enemy.movementPattern.type === "linear") {
        position = linearMovement.linearPosition;
        showDialog = linearMovement.showDialog;
    } else if (enemy.movementPattern.type === "buruburu") {
        position = buruburuMovement.buruburuPosition;
        showDialog = buruburuMovement.showDialog;
    }

    const checkCollision = useCallback((player: { x: number, y: number }, enemy: {
        x: number,
        y: number
    }, padding = 10) => {
        if (!player || !enemy) return false;

        const playerLeft = player.x - padding;
        const playerRight = player.x + 50 + padding;
        const playerTop = player.y - padding;
        const playerBottom = player.y + 50 + padding;

        const enemyLeft = enemy.x - padding;
        const enemyRight = enemy.x + 50 + padding;
        const enemyTop = enemy.y - padding;
        const enemyBottom = enemy.y + 50 + padding;

        return !(
            playerRight < enemyLeft ||
            playerLeft > enemyRight ||
            playerBottom < enemyTop ||
            playerTop > enemyBottom
        );
    }, []);

    useEffect(() => {
        const collision = checkCollision(ECollisionPosition, {x: enemy.x, y: enemy.y});
        setIsColliding(collision);

        if (collision && !isGameOver) {
            setIsGameOver(true); // ゲームオーバーフラグを立てる
        }
    }, [ECollisionPosition, enemy, checkCollision, isGameOver]);

    // ゲームオーバー時の処理
    useEffect(() => {
        if (isGameOver) {
            alert("Game Over! "); // 一度だけログを出力
            setTimeout(() => {
                window.location.reload(); // サイトを再レンダリング
            }, 500); // 1秒後にリロード
        }
    }, [isGameOver]);

    const enemyTalk = () => {
        const dialogues = typeof enemy.dialogues === 'string'
            ? (() => {
                try {
                    return JSON.parse(enemy.dialogues);
                } catch (error) {
                    console.error("Failed to parse dialogues:", error);
                    return [];
                }
            })()
            : enemy.dialogues;

        if (Array.isArray(dialogues) && dialogues.length > 0) {
            return dialogues[1]; // 2 番目のダイアログを返す
        }
        return ""; // ダイアログがない場合のデフォルト
    };
    const isHighlighted = questFillProgress === 1 && enemy.id >= 7 && enemy.id <= 10;

    useEffect(() => {
        if (isColliding && globalMouseDown) {

            const currentTime = Date.now();

            // クールダウン時間が経過しているか確認
            if (currentTime - lastAttackTime >= attackCooldown) {
                console.log("衝突中に左クリックされました！");
                console.log(`敵の名前: ${enemy.name}, 現在HP: ${enemy.hp}`);
                console.log(`敵の移動パターン: ${enemy.movementPattern.type}`);
                console.log(`プレイヤーの位置: x=${ECollisionPosition.x}, y=${ECollisionPosition.y}`);
                console.log(`攻撃力: ${playerAttack}`);

                // 攻撃を実行
                damageEnemy(enemy, playerAttack);

                // 最後の攻撃時間を更新
                setLastAttackTime(currentTime);
            }
        }
    }, [isColliding, globalMouseDown, enemy, position, ECollisionPosition])

    const enemyStyle = {
        shadowColor: isHighlighted ? "red" : "black",
        shadowBlur: isHighlighted ? 10 : 5,
        shadowOpacity: isHighlighted ? 0.8 : 0.5,
    };


    return (
        <Group
            x={position.x - cameraPosition.x}
            y={position.y - cameraPosition.y}
            zIndex={100}
            width={enemy.width}
            height={enemy.height}
            cursor="pointer"
            onClick={() => openDialogue(enemy)}
        >
            {image && (
                <Image
                    image={image}
                    width={enemy.width}
                    height={enemy.height}
                    {...enemyStyle}
                />
            )}
            <Text
                text={enemy.name}
                y={-20}
                fontSize={12}
                fill="red"
                align="center"
                width={64}
            />
            <Text
                text={String(enemy.hp)}
                y={-60}
                fontSize={14}
                fill="red"
                align="center"
                width={64}
            />
            {showDialog && (
                <Text
                    text={enemyTalk()}
                    y={-80}
                    fontSize={14}
                    fill="blue"
                    align="center"
                    width={100}
                />
            )}
        </Group>
    );
};
export default EnemyTest
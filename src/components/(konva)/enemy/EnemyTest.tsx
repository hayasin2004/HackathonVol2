// src/components/(konva)/enemy/EnemyTest.tsx
"use client"
import React, {useCallback, useEffect, useState} from 'react';
import {Stage, Layer, Group, Image, Text} from "react-konva";
import useImage from "use-image";
import {Enemy} from "@/types/enemy";
import useEnemyRandomMovement from "@/hooks/(animation)/enemy/randomEnemy/useEnemyRandomMovement";
import useEnemyLinearRandomMovement from "@/hooks/(animation)/enemy/linearEnemy/useEnemyLinearRandomMovement";
import {PlayerItem} from "@/types/playerItem";
import {Socket} from "socket.io-client";

interface PropsNpcData {
    enemyData: Enemy[] | null
    cameraPosition: { x: number, y: number }
    ECollisionPosition: { x: number, y: number }
    onEnemyRemove?: (enemyId: number) => void  // 敵を削除するための関数を追加
    playerAttack: number
    player?: PlayerItem  // プレイヤー情報を追加
    onPlayerDamage?: (newHp: number) => void  // プレイヤーのHPを更新するコールバック
    socket: Socket | null
}

const currentStage = 1;

const onInteract = (enemy: Enemy, dialogue: any) => {
    console.log("NPCと対話:", enemy.name, dialogue);
};

const EnemyTest: React.FC<PropsNpcData> = ({
                                               enemyData, cameraPosition, player,socket,
                                               onPlayerDamage, onEnemyRemove, ECollisionPosition, playerAttack
                                           }) => {
    const [dialogue, setDialogue] = useState<string | null>(null);
    const [globalMouseDown, setGlobalMouseDown] = useState(false);

    const [playerHP, setPlayerHP] = useState<number>(player?.hp || 100);
    const [isPlayerAlive, setIsPlayerAlive] = useState(true);
    const [visibleEnemies, setVisibleEnemies] = useState<Enemy[]>([]);
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

    const handleRemoveEnemy = (enemyId: number) => {
        console.log(`敵ID: ${enemyId} を削除します`);

        // 親コンポーネントに通知（もし関数が提供されていれば）
        if (onEnemyRemove) {
            onEnemyRemove(enemyId);
        }

        // ローカルの状態も更新
    };

    // もし他のプレイヤーが敵を倒したときの通知
    // ソケットイベントで敵削除を受信
    useEffect(() => {
        if (!socket) return;

        const handleEnemyRemoved = (enemyId: number) => {
            console.log(`敵ID ${enemyId} が削除されました`);
            setVisibleEnemies((prev) => prev.filter((enemy) => enemy.id !== enemyId));
        };

        const handleEnemyHpUpdated = ({ id, hp }: { id: number; hp: number }) => {
            setVisibleEnemies((prev) =>
                prev.map((enemy) =>
                    enemy.id === id ? { ...enemy, hp } : enemy
                )
            );
        };

        socket.on("enemyRemoved", handleEnemyRemoved);
        socket.on("enemyHpUpdated", handleEnemyHpUpdated);

        return () => {
            socket.off("enemyRemoved", handleEnemyRemoved);
            socket.off("enemyHpUpdated", handleEnemyHpUpdated);
        };
    }, [socket]);;





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


        // サーバーにHP更新を送信
        if (socket) {
            socket.emit("updateEnemyHp", enemy.id, newHp);
        }

        // HPが残っている場合は敵のHPを更新
        const updatedEnemy = {...enemy, hp: newHp};
        console.log("updatedEnemy" + JSON.stringify(updatedEnemy))
        setVisibleEnemies(prev =>
            prev.map(e => e.id === enemy.id ? updatedEnemy : e)
        );
        return false; // 敵はまだ生きている
    }, [handleRemoveEnemy,playerAttack , socket]);


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
            console.log("ゲームオーバー！プレイヤーが倒れました。");
        } else {
            // HPを更新
            setPlayerHP(newHP);
            setPlayerHP(newHP);

            if (onPlayerDamage) {
                onPlayerDamage(newHP);
            }
        }
    }, [playerHP, onPlayerDamage, isPlayerAlive]);
    // プレイヤーが死亡している場合、ゲームオーバー表示
    if (!isPlayerAlive) {
        console.log("死亡しました。ゲームオーバーです。")
    }


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
                />
            ))}
            {dialogue && (
                <div className="dialog" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '5px',
                    zIndex: 1000
                }}>
                    <p>{dialogue}</p>
                    <button onClick={() => setDialogue(null)}>Close</button>
                </div>
            )}
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
    onEnemyRemove: (enemyId: number) => void
    damageEnemy: (enemy: Enemy, attackPower: number) => boolean,
    playerAttack: number
    playerHP?: number
}> = ({enemy, cameraPosition, damageEnemy,    damagePlayer, ECollisionPosition, playerHP, globalMouseDown, playerAttack}) => {
    const imageIndex = 1;
    const validImageIndex = enemy.images.length > imageIndex ? imageIndex : 0;
    const [isColliding, setIsColliding] = useState(false);
    const [image] = useImage(enemy.images[validImageIndex]);

    // プレイヤー攻撃のクールダウン
    const [lastAttackTime, setLastAttackTime] = useState(0);
    const attackCooldown = 500; // プレイヤーの攻撃クールダウン時間（ミリ秒）

    // 敵攻撃のクールダウン
    const [lastEnemyAttackTime, setLastEnemyAttackTime] = useState(0);
    const enemyAttackCooldown = 300; // 敵の攻撃クールダウン時間（ミリ秒）

    // 通常のクリックハンドラ（敵をクリックした時）
    const handleClick = () => {
        const dialogues = typeof enemy.dialogues === 'string'
            ? JSON.parse(enemy.dialogues)
            : enemy.dialogues;
        if (dialogues && Array.isArray(dialogues) && dialogues.length > 0) {
            onInteract(enemy, dialogues[0]);
        }
    };

    const enemyTalk = () => {
        // dialoguesが配列であることを確認し、インデックス1の要素を返す
        if (Array.isArray(enemy.dialogues) && enemy.dialogues.length > 1) {
            return enemy.dialogues[1]; // インデックス1の要素を返す
        }
        return ""; // デフォルトで空文字列を返す
    }

    let position: { x: number, y: number }, showDialog;
    if (enemy.movementPattern.type === "random") {
        ({position, showDialog} = useEnemyRandomMovement(enemy?.x, enemy?.y));
    } else if (enemy.movementPattern.type === "linear") {
        const linearMovement = useEnemyLinearRandomMovement(enemy?.x, enemy?.y);
        position = linearMovement.linearPosition;
        showDialog = linearMovement.showDialog;
    } else {
        // random でも linear でもない場合、初期位置を使用
        position = {x: enemy?.x, y: enemy?.y};
        showDialog = false;
    }

    const checkCollision = useCallback((
        player: { x: number, y: number },
        enemy: { x: number, y: number },
        padding = 10) => {
        // paddingを使用して衝突判定の範囲を調整
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
        const collision = checkCollision(ECollisionPosition, position);
        setIsColliding(collision);
    }, [ECollisionPosition, position, checkCollision]);

    // 衝突中に左クリックされた場合のログ出力
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
    }, [isColliding, globalMouseDown, enemy, position, ECollisionPosition]);



    // 敵からプレイヤーへの攻撃処理（衝突中は自動的に攻撃）
    useEffect(() => {
        let attackInterval: NodeJS.Timeout;

        if (isColliding) {
            // 衝突中は定期的に攻撃
            attackInterval = setInterval(() => {
                const currentTime = Date.now();

                // 敵の攻撃クールダウンが経過しているか確認
                if (currentTime - lastEnemyAttackTime >= enemyAttackCooldown) {
                    console.log(`${enemy.name}がプレイヤーを攻撃！攻撃力: ${enemy.attack}`);


                    // プレイヤーにダメージを与える
                    damagePlayer(enemy.attack);

                    // 最後の敵攻撃時間を更新
                    setLastEnemyAttackTime(currentTime);
                }
            }, enemyAttackCooldown);
        }

        // クリーンアップ関数
        return () => {
            if (attackInterval) {
                clearInterval(attackInterval);
            }
        };
    }, [isColliding, enemy, damagePlayer, lastEnemyAttackTime, enemyAttackCooldown]);



    return (
        <Group
            x={position.x - cameraPosition.x}
            y={position.y - cameraPosition.y}

            width={enemy.width}
            height={enemy.height}
            cursor="pointer"
            onClick={handleClick}
            onTap={handleClick}
        >
            {image && (
                <Image
                    image={image}
                    width={enemy.width}
                    height={enemy.height}
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

export default EnemyTest;
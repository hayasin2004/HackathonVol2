import {useEffect, useState} from "react";

const useEnemyBuruBuruMovement = (initialX: number = 0, initialY: number = 0) => {
    const [buruburuPosition, setBuruburuPosition] = useState({ x: initialX, y: initialY });
    const [showDialog, setShowDialog] = useState(false);

    // ダイアログ表示のランダム制御
    useEffect(() => {
        const dialogInterval = setInterval(() => {
            // 10%の確率でダイアログを表示
            if (Math.random() < 0.1) {
                setShowDialog(true);
                setTimeout(() => setShowDialog(false), 2000); // 2秒後に非表示
            }
        }, 5000); // 5秒ごとにチェック

        return () => clearInterval(dialogInterval);
    }, []);

    // ブルブル震える動き
    useEffect(() => {
        const buruburuInterval = setInterval(() => {
            // -5から5の間のランダムな値を生成してx座標に加算
            const randomOffset = Math.floor(Math.random() * 11) - 5;
            setBuruburuPosition({
                x: initialX + randomOffset,
                y: initialY // Y座標は変更しない
            });
        }, 300); // 0.3秒ごとに位置を更新

        return () => clearInterval(buruburuInterval);
    }, [initialX, initialY]);

    return { buruburuPosition, showDialog };
};

export default useEnemyBuruBuruMovement;
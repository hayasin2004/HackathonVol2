import { useEffect } from "react";

export const useKeyboardControl = (updatePosition: (deltaX: number, deltaY: number) => void) => {
    useEffect(() => {
        const DELTA = 30; // 移動量を定義

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.keyCode) {
                case 37: // 左矢印キー
                    updatePosition(-DELTA, 0);
                    break;
                case 38: // 上矢印キー
                    updatePosition(0, -DELTA);
                    break;
                case 39: // 右矢印キー
                    updatePosition(DELTA, 0);
                    break;
                case 40: // 下矢印キー
                    updatePosition(0, DELTA);
                    break;
                default:
                    break;
            }
            e.preventDefault(); // デフォルト動作を無効化
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [updatePosition]);
};
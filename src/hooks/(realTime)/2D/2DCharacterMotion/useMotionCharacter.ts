    import {KeyboardEvent, useEffect, useRef, useState} from 'react';
    import {CharacterImageData} from "@/types/character";

    const useMotionCharacter = (characterImageData:CharacterImageData | null) => {

        const [playerCharacter, setPlayerCharacter] = useState<HTMLImageElement | null>(null);

        const lastKeyPressTimeRef = useRef<number>(0);
        const currentDirectionRef = useRef<string>("default");
        const animationIntervalRef = useRef<number | null>(null);
        const frameRef = useRef<number>(0); // 0: 静止画, 1: 歩行モーション
        const [isLoadingCharacter, setIsLoadingCharacter] = useState(true)
        const playerDirection = useRef<number>(0);

        const keyToIndexMap: Record<string, number> = {
            ArrowDown: 0,
            ArrowUp: 1,
            ArrowRight: 2,
            ArrowLeft: 3,
        };

        const loadPlayerImage = async (src: string) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
                setPlayerCharacter(img)
                setIsLoadingCharacter(false)
            };
        };



        useEffect(() => {
            // 初期は静止画像を表示
            console.log(characterImageData?.iconImage?.[0])
            loadPlayerImage(characterImageData?.iconImage?.[0]);

            const handleKeyDown = (event: KeyboardEvent) => {
                const staticImages = characterImageData?.iconImage?.slice(0, 4);   // 静止
                const walkImages = characterImageData?.iconImage?.slice(4, 8);    // 歩行
                const direction = event.key;
                const now = Date.now();
                lastKeyPressTimeRef.current = now;
                currentDirectionRef.current = direction;
                console.log(`Current direction: ${currentDirectionRef.current}`);
                const index = keyToIndexMap[direction];
                if (index === undefined) return;
                playerDirection.current = index;
                loadPlayerImage(staticImages?.[index]);

                if (animationIntervalRef.current === null) {
                    frameRef.current = 0;
                    animationIntervalRef.current = window.setInterval(() => {
                        const currentTime = Date.now();
                        const currentDirection = currentDirectionRef.current;
                        const idx = keyToIndexMap[currentDirection];

                        if (currentTime - lastKeyPressTimeRef.current > 600) {
                            // 入力が途切れたら静止画像に戻す
                            loadPlayerImage(staticImages?.[idx]);
                            clearInterval(animationIntervalRef.current!);
                            animationIntervalRef.current = null;
                        } else {
                            // 静止画像と歩行画像を交互に
                            const img = frameRef.current === 0 ? staticImages?.[idx] : walkImages?.[idx];
                            loadPlayerImage(img);
                            frameRef.current = 1 - frameRef.current;
                        }
                    }, 300);
                }
            };

            window.addEventListener("keydown", handleKeyDown);
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
                if (animationIntervalRef.current) {
                    clearInterval(animationIntervalRef.current);
                    animationIntervalRef.current = null;
                }
            };
        }, [characterImageData]);

        return {playerCharacter , isLoadingCharacter ,currentDirectionRef ,playerDirection}
    };

    export default useMotionCharacter;
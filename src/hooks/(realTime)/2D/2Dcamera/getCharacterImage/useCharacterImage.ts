import {useEffect, useState} from 'react';

const useGetCharacterImage = (itemData) => {
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: HTMLImageElement }>({});

    useEffect(() => {

        const loadImages = async () => {
            const images: { [key: string]: HTMLImageElement } = {};
            if (!itemData) {
                console.warn("itemData is not available for loading images.");
                setLoadedImages({});
                return;
            }
            try {
                await Promise.all(
                    itemData.map(async (data) => {
                        if (data?.id && data.itemIcon) {
                            const img = new window.Image();
                            img.src = data.itemIcon;
                            await new Promise((resolve) => {
                                img.onload = () => {
                                    images[String(data.id)] = img;
                                    resolve(true);
                                };
                                img.onerror = (err) => {
                                    console.error(`Failed to load image: ${data.itemIcon}`, err);
                                    resolve(false);
                                };
                            });
                        }
                    })
                );
                setLoadedImages(images);
                console.log("Item images loaded:", Object.keys(images).length);
            } catch (error) {
                console.error("Error loading item images:", error);
            }
        };
        loadImages()
    }, [itemData]);
    return loadedImages;
};

export default useGetCharacterImage;
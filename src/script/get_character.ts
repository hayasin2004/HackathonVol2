export const get_character = async (userId : number) => {
    try {
        console.log("これでキャラクター取得してる")
        const response = await fetch(`/api/character/image/${userId}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        });
        if (response.ok) {
            const data = await response.json();
            return data.userData
        } else {
            console.error("Failed to fetch character images");
        }
    } catch (error) {
        console.error("Error fetching character images:", error);
    }
};
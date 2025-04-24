import NpcTest from "@/components/(konva)/npc/NpcTest";
import {GetNpc} from "@/repository/prisma/npc/npcRepository";

const GetNpcPage = async () => {
    const npcData = await GetNpc()
    console.log(npcData)
    return (
        <NpcTest npcData={npcData} />
    )



}

export default GetNpcPage
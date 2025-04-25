import NpcTest from "@/components/(konva)/npc/NpcTest";
import {GetNpc} from "@/repository/prisma/npc/npcRepository";
import {GetEnemy} from "@/repository/prisma/enemy/enemyRepository";
import EnemyTest from "@/components/(konva)/enemy/EnemyTest";

const GetNpcPage = async () => {
    const enemyData = await GetEnemy()
    console.log(enemyData)
    return (
        <EnemyTest enemyData={enemyData} />
    )



}

export default GetNpcPage
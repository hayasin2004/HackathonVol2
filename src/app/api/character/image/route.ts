
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
    const { userId } = await req.json()

    const { data: characters , error } = await supabase
        .from("Character")
        .select("id, iconImage")
        .eq("userId", userId)

  // ✅ 3. 各キャラの最初の8枚の画像URLを作成
  const imageSets = characters.map(character => {
    const filePaths = character.iconImage.slice(0, 8) // 最初の8枚
    const urls = filePaths.map((path: string) =>
      supabase.storage.from('hackathon2-picture-storage').getPublicUrl(path).data.publicUrl
    )

    return {
      characterId: character.id,
      imageUrls: urls,
    }
  })

  return imageSets
}
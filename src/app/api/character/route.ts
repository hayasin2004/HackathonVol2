
import prisma from "@/lib/prismaClient"

export async function POST(req: Request) {

  const { userId, iconImage, parts } = await req.json();

  try {
    const newCharacter = await prisma.character.create({
      data: {
        userId,
        iconImage,
        parts,
      },
    });

    return new Response(JSON.stringify(newCharacter), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("Failed to create character", { status: 500 });
  }
}

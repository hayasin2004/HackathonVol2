import { NextResponse } from "next/server";
import { confirmCharacter } from "../../../script/confirm_character";

export async function POST(request: Request) {
  try {
    const { frontFileName } = await request.json();
    if (!frontFileName) {
      throw new Error("frontFileName is required.");
    }
    const baseNameMatch = frontFileName.match(/^(.+)_front\.png$/i);
    if (!baseNameMatch) {
      throw new Error("frontFileName の形式が不正です。");
    }
    const baseName = baseNameMatch[1];

    const finalImages = await confirmCharacter(baseName);
    return NextResponse.json(finalImages);
  } catch (error) {
    console.error("Error in confirmCharacter API route:", error);
    return NextResponse.error();
  }
}

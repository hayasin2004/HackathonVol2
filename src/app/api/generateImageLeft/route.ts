import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";

export async function POST(request: Request) {
  try {
    const {
      originalFileName,
      gender,
      hairStyle,
      hairColor,
      eyeType,
      eyeColor,
      additional,
      upperClothing,
      upperClothingColor,
      lowerClothing,
      lowerClothingColor,
      shoes,
      shoesColor,
    } = await request.json();

    const basePrompt = `Create a pixel art illustration with the following fixed conditions:
- Style: Cute chibi character
- Canvas: 64x64 pixels, square
- Background: Pure white
- Only one character, fully visible
- The illustration must strictly adhere to a chibi style`;

    const hairStyleDescriptions: { [key: string]: string } = {
      "ベリーショート": "The character sports a very short haircut with hair covering about half of the face.",
      "ショート": "The character has a neat short hairstyle with hair covering around the full face.",
      "ミディアム": "The character's medium-length hair extends just past the shoulders.",
      "セミロング": "The character's semi-long hair reaches down to the waist.",
      "ロング": "The character's long hair extends down to the knees.",
    };

    const eyeTypeDescriptions: { [key: string]: string } = {
      "丸目": "Large, round eyes that radiate innocence.",
      "アーモンド目": "Almond-shaped eyes with a refined look.",
      "つり目": "Upturned eyes with a dynamic expression.",
      "たれ目": "Droopy eyes that convey warmth.",
    };

    const headDescription = `
Head Features:
- Gender: ${gender} (${gender === "男性" ? "masculine" : "feminine"}).
- Hair: ${hairStyle} style. ${hairStyleDescriptions[hairStyle] || ""}
  Hair Color: ${hairColor}.
- Eyes: ${eyeType} shape. ${eyeTypeDescriptions[eyeType] || ""}
  Eye Color: ${eyeColor}.
${additional ? `- Additional Features: ${additional}` : ""}
    `.trim();

    let clothingDescription = `Clothing Details:
- Upper Clothing: ${upperClothing} in ${upperClothingColor} color.`;
    if (upperClothing === "ロングドレス") {
      clothingDescription += " (Full-body dress)";
    } else {
      clothingDescription += `\n- Lower Clothing: ${lowerClothing} in ${lowerClothingColor} color.`;
    }
    clothingDescription += `\n- Shoes: ${shoes} in ${shoesColor} color.`;

    const directionInstruction = "Character facing left. Profile view from the left side, showing the character looking towards the left side of the frame. Maintain all original details of the character's design, clothing, and style, only changing the viewing angle.";

    const finalPrompt = `${basePrompt}\n${headDescription}\n${clothingDescription}\n${directionInstruction}`;

    const referenceImagePath = path.join(process.cwd(), "public", originalFileName);
    const imageData = fs.readFileSync(referenceImagePath);
    const base64Image = imageData.toString("base64");

    const contents = [
      { text: finalPrompt },
      { inlineData: { mimeType: "image/png", data: base64Image } },
    ];

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not set.");

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents,
      config: { responseModalities: ["Text", "Image"] },
    });

    let generatedBuffer: Buffer | null = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        generatedBuffer = Buffer.from(part.inlineData.data, "base64");
        break;
      }
    }
    if (!generatedBuffer) throw new Error("No image data received for left view.");

    const newFileName = originalFileName.replace("front", "left");
    const outputPath = path.join(process.cwd(), "public", newFileName);
    fs.writeFileSync(outputPath, generatedBuffer);

    return NextResponse.json({ imageUrl: `/${newFileName}`, fileName: newFileName });
  } catch (error) {
    console.error("Error in generateImageLeft API route:", error);
    return NextResponse.error();
  }
}

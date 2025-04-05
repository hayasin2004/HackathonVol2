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
      "ベリーショート": "The character sports a very short, cropped haircut that emphasizes facial features, with hair covering about half of the face.",
      "ショート": "The character has a neat short hairstyle offering a clean and practical look, with hair covering around the full face.",
      "ミディアム": "The character's medium-length hair provides a balanced and versatile appearance, with hair extending just past the shoulders.",
      "セミロング": "The character has semi-long hair that adds a touch of subtle elegance, with hair reaching down to the waist.",
      "ロング": "The character displays long, flowing hair that exudes sophistication and charm, with hair extending down to the knees.",
    };

    const eyeTypeDescriptions: { [key: string]: string } = {
      "丸目": "The character's large, round eyes radiate innocence and charm.",
      "アーモンド目": "The character's almond-shaped eyes give a refined and gentle look.",
      "つり目": "The character's upturned eyes add a dynamic and sharp expression.",
      "たれ目": "The character's droopy eyes convey warmth and a friendly demeanor.",
    };

    const headDescription = `
Head Features:
- Gender: ${gender} — depicted as ${gender === "男性" ? "masculine" : "feminine"}.
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

    const motionInstruction = "Left walk motion: Generate an image showing the character walking from a left-side view. One arm and one leg should swing forward while all other details remain exactly the same.";

    const finalPrompt = `${basePrompt}\n${headDescription}\n${clothingDescription}\n${motionInstruction}`;

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
    if (!generatedBuffer) throw new Error("No image data received for left walk motion.");

    const newFileName = originalFileName.replace("left", "left_walk");
    const outputPath = path.join(process.cwd(), "public", newFileName);
    fs.writeFileSync(outputPath, generatedBuffer);

    return NextResponse.json({ imageUrl: `/${newFileName}`, fileName: newFileName });
  } catch (error) {
    console.error("Error in generateImageLeftWalk API route:", error);
    return NextResponse.error();
  }
}

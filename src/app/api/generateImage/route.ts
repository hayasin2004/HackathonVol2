import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";

export async function POST(request: Request) {
  try {
    const {
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
- Only one character, facing forward and fully visible
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
${additional && additional.trim() !== "" ? `- Additional Features: ${additional}` : ""}
    `.trim();

    let clothingDescription = `Clothing Details:
- Upper Clothing: ${upperClothing} in ${upperClothingColor} color.`;
    if (upperClothing === "ロングドレス") {
      clothingDescription += " This is a full-body dress, so lower clothing is omitted.";
    } else {
      clothingDescription += `\n- Lower Clothing: ${lowerClothing} in ${lowerClothingColor} color.`;
    }
    clothingDescription += `\n- Shoes: ${shoes} in ${shoesColor} color.`;

    const finalPrompt = `${basePrompt}\n${headDescription}\n${clothingDescription}`;

    // 性別に応じたサンプル画像選択
    let sampleImagePath = "";
    if (gender === "男性") {
      sampleImagePath = path.join(process.cwd(), "public", "SampleImageMale.png");
    } else {
      sampleImagePath = path.join(process.cwd(), "public", "SampleImageFemale.png");
    }
    const imageData = fs.readFileSync(sampleImagePath);
    const base64Image = imageData.toString("base64");

    const contents = [
      { text: finalPrompt },
      { inlineData: { mimeType: "image/png", data: base64Image } },
    ];

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not set in environment variables.");

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents,
      config: { responseModalities: ["Text", "Image"] },
    });

    let generatedImageBuffer: Buffer | null = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        generatedImageBuffer = Buffer.from(part.inlineData.data, "base64");
        break;
      }
    }
    console.log("generatedImageBuffer確認" + generatedImageBuffer)
    if (!generatedImageBuffer) throw new Error("No image data received from Gemini API.");

    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const fileName = `${timestamp}_front.png`;
    const outputPath = path.join(process.cwd(), "public", fileName);
    fs.writeFileSync(outputPath, generatedImageBuffer);

    return NextResponse.json({ imageUrl: `/${fileName}`, fileName });
  } catch (error) {
    console.error("Error in generateImage API route:", error);
    return NextResponse.error();
  }
}

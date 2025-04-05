"use client";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();
  // Head & Clothing features
  const [gender, setGender] = useState("女性");
  const [hairStyle, setHairStyle] = useState("ベリーショート");
  const [hairColor, setHairColor] = useState("ブラック");
  const [eyeType, setEyeType] = useState("丸目");
  const [eyeColor, setEyeColor] = useState("ブラック");
  const [additional, setAdditional] = useState("");

  const [upperClothing, setUpperClothing] = useState("シャツ");
  const [upperClothingColor, setUpperClothingColor] = useState("ブルー");
  const [lowerClothing, setLowerClothing] = useState("パンツ");
  const [lowerClothingColor, setLowerClothingColor] = useState("ブラック");
  const [shoes, setShoes] = useState("スニーカー");
  const [shoesColor, setShoesColor] = useState("ホワイト");

  // Front view 生成結果（キャラクター生成／再生成）
  const [frontImageUrl, setFrontImageUrl] = useState("");
  const [frontFileName, setFrontFileName] = useState("");

  // 静止画像（Back, Right, Left）の生成結果
  const [staticImages, setStaticImages] = useState<{
    back?: string;
    right?: string;
    left?: string;
  }>({});

  // 歩行モーション画像の生成結果
  const [motionImages, setMotionImages] = useState<{
    front?: string;
    back?: string;
    right?: string;
    left?: string;
  }>({});

  // 確定後の最終画像情報（リサイズ済み静止画像、モーション画像、GIF）
  const [finalImages, setFinalImages] = useState<{
    static?: { front?: string; back?: string; right?: string; left?: string };
    motion?: { front?: string; back?: string; right?: string; left?: string };
    gif?: { front?: string; back?: string; right?: string; left?: string };
  }>();

  const [loading, setLoading] = useState(false);
  const [staticLoading, setStaticLoading] = useState(false);
  const [motionLoading, setMotionLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const colorOptions = [
    "ブラック",
    "ブラウン",
    "ブロンド",
    "レッド",
    "ブルー",
    "グリーン",
    "パープル",
    "ピンク",
    "グレー",
    "ホワイト",
    "オレンジ",
    "イエロー",
  ];
  const upperClothingOptions = ["シャツ", "ジャケット", "ロングドレス"];
  const lowerClothingOptions = ["パンツ", "スカート"];
  const shoesOptions = ["スニーカー", "ブーツ", "サンダル"];

  // Front view 生成（キャラクター生成／再生成）
  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFrontImageUrl("");
    setStaticImages({});
    setMotionImages({});
    setFinalImages(undefined);
    setFrontFileName("");

    const payload = {
      gender,
      hairStyle,
      hairColor,
      eyeType,
      eyeColor,
      additional,
      upperClothing,
      upperClothingColor,
      lowerClothing: upperClothing === "ロングドレス" ? "" : lowerClothing,
      lowerClothingColor:
        upperClothing === "ロングドレス" ? "" : lowerClothingColor,
      shoes,
      shoesColor,
    };

    try {
      const res = await fetch("/api/generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("キャラクター生成に失敗しました");
      const data = await res.json();
      setFrontImageUrl(data.imageUrl);
      setFrontFileName(data.fileName);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 静止画像（各方向：Back, Right, Left）生成
  const handleStaticGenerate = async () => {
    if (!frontFileName) return;
    setStaticLoading(true);
    try {
      const payload = {
        originalFileName: frontFileName,
        gender,
        hairStyle,
        hairColor,
        eyeType,
        eyeColor,
        additional,
        upperClothing,
        upperClothingColor,
        lowerClothing: upperClothing === "ロングドレス" ? "" : lowerClothing,
        lowerClothingColor:
          upperClothing === "ロングドレス" ? "" : lowerClothingColor,
        shoes,
        shoesColor,
      };

      const [backRes, rightRes, leftRes] = await Promise.all([
        fetch("/api/generateImageBack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/generateImageRight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/generateImageLeft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      ]);

      if (!backRes.ok || !rightRes.ok || !leftRes.ok) {
        throw new Error("追加画像生成に失敗しました");
      }

      const backData = await backRes.json();
      const rightData = await rightRes.json();
      const leftData = await leftRes.json();

      setStaticImages({
        back: backData.imageUrl,
        right: rightData.imageUrl,
        left: leftData.imageUrl,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setStaticLoading(false);
    }
  };

  // 歩行モーション画像生成（各方向：Front, Back, Right, Left）
  const handleMotionGenerate = async () => {
    if (
      !frontFileName ||
      !staticImages.back ||
      !staticImages.right ||
      !staticImages.left
    ) {
      alert("静止画像が全て生成されていません。");
      return;
    }
    setMotionLoading(true);
    try {
      const extractFileName = (url: string) => url.split("/").pop() || "";
      const frontStaticFile = frontFileName;
      const backStaticFile = extractFileName(staticImages.back);
      const rightStaticFile = extractFileName(staticImages.right);
      const leftStaticFile = extractFileName(staticImages.left);

      const basePayload = {
        gender,
        hairStyle,
        hairColor,
        eyeType,
        eyeColor,
        additional,
        upperClothing,
        upperClothingColor,
        lowerClothing: upperClothing === "ロングドレス" ? "" : lowerClothing,
        lowerClothingColor:
          upperClothing === "ロングドレス" ? "" : lowerClothingColor,
        shoes,
        shoesColor,
      };

      const payloadFront = {
        ...basePayload,
        originalFileName: frontStaticFile,
      };
      const payloadBack = { ...basePayload, originalFileName: backStaticFile };
      const payloadRight = {
        ...basePayload,
        originalFileName: rightStaticFile,
      };
      const payloadLeft = { ...basePayload, originalFileName: leftStaticFile };

      const [frontRes, backRes, rightRes, leftRes] = await Promise.all([
        fetch("/api/generateImageFrontWalk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadFront),
        }),
        fetch("/api/generateImageBackWalk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadBack),
        }),
        fetch("/api/generateImageRightWalk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadRight),
        }),
        fetch("/api/generateImageLeftWalk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadLeft),
        }),
      ]);

      if (!frontRes.ok || !backRes.ok || !rightRes.ok || !leftRes.ok) {
        throw new Error("モーション画像生成に失敗しました");
      }

      const frontMotionData = await frontRes.json();
      const backMotionData = await backRes.json();
      const rightMotionData = await rightRes.json();
      const leftMotionData = await leftRes.json();

      setMotionImages({
        front: frontMotionData.imageUrl,
        back: backMotionData.imageUrl,
        right: rightMotionData.imageUrl,
        left: leftMotionData.imageUrl,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setMotionLoading(false);
    }
  };

  // キャラクター確定処理（リサイズ＆GIF化）
  const handleConfirmCharacter = async () => {
    if (
      !frontFileName ||
      !staticImages.back ||
      !staticImages.right ||
      !staticImages.left ||
      !motionImages.front ||
      !motionImages.back ||
      !motionImages.right ||
      !motionImages.left
    ) {
      alert("全ての画像が生成されていません。");
      return;
    }
    setConfirmLoading(true);
    try {
      const res = await fetch("/api/confirmCharacter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frontFileName }),
      });
      if (!res.ok) throw new Error("キャラクター確定処理に失敗しました");
      const data = await res.json();
      // data は以下の形式を想定：
      // {
      //   static: { front, back, right, left },
      //   motion: { front, back, right, left },
      //   gif: { front, back, right, left }
      // }
      setFinalImages(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  //12枚の生成画像をsupabaseのstorageに保存する処理を追加
  const uploadImageToSupabase = async (
    fileUrl: string,
    storagePath: string
  ) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from("hackathon2-picture-storage") // Storage バケット名
        .upload(storagePath, blob, {
          contentType: "image/png", // 必要に応じて変更
          upsert: true,
        });

      if (error) throw error;

      const publicUrl = supabase.storage
        .from("hackathon2-picture-storage")
        .getPublicUrl(storagePath).data.publicUrl;
      return publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  type ViewType = "front" | "back" | "right" | "left";
  type ImageType = "static" | "motion" | "gif";

  const handleSaveAllImages = async () => {
    const user = session?.user.id;
    console.log(user);
    if (!finalImages) return;


    const characterId = frontFileName.replace(/\.[^/.]+$/, "");

    const uploadedImageUrls: string[] = [];


    const imageTypes: ImageType[] = ["static", "motion", "gif"];
    const views: ViewType[] = ["front", "back", "right", "left"];

    for (const type of imageTypes) {
      const images = finalImages[type];
      if (!images) continue;

      for (const view of views) {
        const url = images[view];
        if (!url) continue;

        const filePath = `${characterId}/${type}/${view}.png`;
        const publicUrl = await uploadImageToSupabase(url, filePath); // base64 or Blob URL対応してる？

        if (publicUrl) {
          uploadedImageUrls.push(publicUrl);
          console.log(`${type} ${view} uploaded:`, publicUrl);
        }
      }
    }

      // 👇 Characterを作成して画像URLを保存する
  const res = await fetch("/api/character", {
    method: "POST",
    body: JSON.stringify({
      userId: user,
      iconImage: uploadedImageUrls,
      parts: {}, // 必要に応じて
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.ok) {
    alert("画像をSupabaseに保存して、DBに登録しました！");
    router.push("/roomsDetail/2");
  } else {
    alert("保存に失敗しました");
  }
  };

  return (
    <div>
      <h1>Gemini Character Editor</h1>
      <form onSubmit={handleGenerate}>
        <h2>Head Features</h2>
        <label>
          性別:
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="女性">女性</option>
            <option value="男性">男性</option>
          </select>
        </label>
        <br />
        <label>
          髪型:
          <select
            value={hairStyle}
            onChange={(e) => setHairStyle(e.target.value)}
          >
            <option value="ベリーショート">ベリーショート</option>
            <option value="ショート">ショート</option>
            <option value="ミディアム">ミディアム</option>
            <option value="セミロング">セミロング</option>
            <option value="ロング">ロング</option>
          </select>
        </label>
        <br />
        <label>
          髪色:
          <select
            value={hairColor}
            onChange={(e) => setHairColor(e.target.value)}
          >
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          目の形:
          <select value={eyeType} onChange={(e) => setEyeType(e.target.value)}>
            <option value="丸目">丸目</option>
            <option value="アーモンド目">アーモンド目</option>
            <option value="つり目">つり目</option>
            <option value="たれ目">たれ目</option>
          </select>
        </label>
        <br />
        <label>
          目の色:
          <select
            value={eyeColor}
            onChange={(e) => setEyeColor(e.target.value)}
          >
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          その他の特徴:
          <textarea
            placeholder="例: 猫耳や特別なアクセサリーなど"
            value={additional}
            onChange={(e) => setAdditional(e.target.value)}
          />
        </label>
        <br />
        <h2>Clothing</h2>
        <label>
          上半身:
          <select
            value={upperClothing}
            onChange={(e) => setUpperClothing(e.target.value)}
          >
            {upperClothingOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          上半身の色:
          <select
            value={upperClothingColor}
            onChange={(e) => setUpperClothingColor(e.target.value)}
          >
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>
        <br />
        {upperClothing !== "ロングドレス" && (
          <>
            <label>
              下半身:
              <select
                value={lowerClothing}
                onChange={(e) => setLowerClothing(e.target.value)}
              >
                {lowerClothingOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <label>
              下半身の色:
              <select
                value={lowerClothingColor}
                onChange={(e) => setLowerClothingColor(e.target.value)}
              >
                {colorOptions.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </label>
            <br />
          </>
        )}
        <label>
          靴:
          <select value={shoes} onChange={(e) => setShoes(e.target.value)}>
            {shoesOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          靴の色:
          <select
            value={shoesColor}
            onChange={(e) => setShoesColor(e.target.value)}
          >
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading
            ? "生成中..."
            : frontImageUrl
            ? "キャラクター再生成"
            : "キャラクター生成"}
        </button>
      </form>

      {frontImageUrl && (
        <div>
          <h2>生成された画像 (Front View):</h2>
          <img
            src={`${frontImageUrl}?t=${Date.now()}`}
            alt="Front View"
            style={{ imageRendering: "pixelated" }}
          />
          <br />
          <button onClick={handleStaticGenerate} disabled={staticLoading}>
            {staticLoading ? "別角度生成中..." : "キャラクター別角度生成"}
          </button>
        </div>
      )}

      {staticImages.back && staticImages.right && staticImages.left && (
        <div>
          <h2>追加生成された画像 (静止画像):</h2>
          <div>
            <h3>Back View:</h3>
            <img
              src={`${staticImages.back}?t=${Date.now()}`}
              alt="Back View"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div>
            <h3>Right View:</h3>
            <img
              src={`${staticImages.right}?t=${Date.now()}`}
              alt="Right View"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div>
            <h3>Left View:</h3>
            <img
              src={`${staticImages.left}?t=${Date.now()}`}
              alt="Left View"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      )}

      {frontImageUrl &&
        staticImages.back &&
        staticImages.right &&
        staticImages.left && (
          <div>
            <h2>モーション画像:</h2>
            <button onClick={handleMotionGenerate} disabled={motionLoading}>
              {motionLoading
                ? "モーション生成中..."
                : motionImages.front
                ? "キャラクターモーション再生成"
                : "キャラクターモーション生成"}
            </button>
            {motionImages.front &&
              motionImages.back &&
              motionImages.right &&
              motionImages.left && (
                <div>
                  <h3>Front Walk:</h3>
                  <img
                    src={`${motionImages.front}?t=${Date.now()}`}
                    alt="Front Walk"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <h3>Back Walk:</h3>
                  <img
                    src={`${motionImages.back}?t=${Date.now()}`}
                    alt="Back Walk"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <h3>Right Walk:</h3>
                  <img
                    src={`${motionImages.right}?t=${Date.now()}`}
                    alt="Right Walk"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <h3>Left Walk:</h3>
                  <img
                    src={`${motionImages.left}?t=${Date.now()}`}
                    alt="Left Walk"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              )}
          </div>
        )}

      {frontImageUrl &&
        staticImages.back &&
        staticImages.right &&
        staticImages.left &&
        motionImages.front &&
        motionImages.back &&
        motionImages.right &&
        motionImages.left && (
          <div>
            <h2>確定画像 (リサイズ済み & GIF化)：</h2>
            <button onClick={handleConfirmCharacter} disabled={confirmLoading}>
              {confirmLoading ? "確定中..." : "キャラクターを確定"}
            </button>
          </div>
        )}

      {finalImages && (
        <div>
          <h2>最終結果</h2>
          <h3>静止画像 (64×64)：</h3>
          <div>
            <img
              src={`${finalImages.static?.front}?t=${Date.now()}`}
              alt="Front Resized"
              style={{ imageRendering: "pixelated" }}
            />
            <img
              src={`${finalImages.static?.back}?t=${Date.now()}`}
              alt="Back Resized"
              style={{ imageRendering: "pixelated" }}
            />
            <img
              src={`${finalImages.static?.right}?t=${Date.now()}`}
              alt="Right Resized"
              style={{ imageRendering: "pixelated" }}
            />
            <img
              src={`${finalImages.static?.left}?t=${Date.now()}`}
              alt="Left Resized"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <h3>モーション画像 (64×64)：</h3>
          <div>
            <img
              src={`${finalImages.motion?.front}?t=${Date.now()}`}
              alt="Front Walk Resized"
              style={{ imageRendering: "pixelated" }}
            />
            <img
              src={`${finalImages.motion?.back}?t=${Date.now()}`}
              alt="Back Walk Resized"
              style={{ imageRendering: "pixelated" }}
            />
            <img
              src={`${finalImages.motion?.right}?t=${Date.now()}`}
              alt="Right Walk Resized"
              style={{ imageRendering: "pixelated" }}
            />
            <img
              src={`${finalImages.motion?.left}?t=${Date.now()}`}
              alt="Left Walk Resized"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <h3>GIF アニメーション：</h3>
          <div>
            <img
              src={`${finalImages.gif?.front}?t=${Date.now()}`}
              alt="Front Motion GIF"
              style={{ imageRendering: "pixelated" }}
            />
            <img
              src={`${finalImages.gif?.back}?t=${Date.now()}`}
              alt="Back Motion GIF"
              style={{ imageRendering: "pixelated" }}
            />
            <img
              src={`${finalImages.gif?.right}?t=${Date.now()}`}
              alt="Right Motion GIF"
              style={{ imageRendering: "pixelated" }}
            />
            <img
              src={`${finalImages.gif?.left}?t=${Date.now()}`}
              alt="Left Motion GIF"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div>
            <button onClick={handleSaveAllImages}>Supabaseに画像保存</button>
          </div>
        </div>
      )}
    </div>
  );
}

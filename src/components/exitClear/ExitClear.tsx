// components/GameClearView.tsx
import Image from "next/image";

const ExitClearPage = () => {
  const colors = [
    "#FF0000",
    "#FFA500",
    "#FFFF00",
    "#008000",
    "#0000FF",
    "#4B0082",
    "#EE82EE",
    "#FF4500",
    "#00CED1",
    "#32CD32",
  ]; // 10色（虹色をベース）

  return (
    <div
      style={{
        backgroundColor: "#fff",
        height: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      {/* キャラクター画像 */}
      <div style={{ position: "relative", width: 600, height: 350 }}>
        <Image
          src="/enemys2.png"
          alt="Among Us Characters"
          layout="fill"
          objectFit="contain"
        />
      </div>

      {/* GAME CLEAR の文字 */}
      <h1
        style={{
          marginTop: 30,
          letterSpacing: "10px",
          fontSize: "3rem",
          display: "flex",
        }}
      >
        {"GAME CLEAR".split("").map((char, index) => (
          <span key={index} style={{ color: colors[index % colors.length] }}>
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default ExitClearPage;

// components/GameClearView.tsx
import Image from "next/image";

const ExitClearPage = () => {
  return (
    <div
      style={{
        backgroundColor: "#000",
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
          src="/enemys.png" // publicフォルダに置いた画像名
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
          color: "white",
        }}
      >
        GAME CLEAR
      </h1>
    </div>
  );
};

export default ExitClearPage;

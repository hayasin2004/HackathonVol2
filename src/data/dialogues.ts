// data/dialogues.ts

// ランダム対話の一つのエントリーの型定義
export interface DialogueEntry {
    id: string; // ユニークな対話ID (デバッグ用など)
    lines: string[]; // 対話の複数行
    // tags?: string[]; // ★タグプロパティは不要になるため削除またはオプションのままにする
}

// ランダム対話のプールデータ
// どのNPCでもこれらの対話がランダムに選ばれる可能性がある
export const randomDialoguePool: DialogueEntry[] = [
    {
        id: "rand_ai_comment_01",
        lines: [
            "AIが最後の仕事、この土いじりまで奪いに来たって聞くが…",
            "まあ、そう簡単にはいかねぇもんだよ。",
            "データやプログラムだけじゃ、この土の匂いは分からんさ。"
        ],
    },
     {
        id: "rand_greeting_01",
        lines: [
            "おや、あんたかい。こんな所まで珍しいねぇ。",
            "今日もいい天気で、歩きやすいね。",
        ],
    },
    {
        id: "rand_complaint_01",
        lines: [
            "全く、最近は変な機械が空を飛んでて落ち着かんよ。",
            "どうにも騒がしくてかなわん。",
        ],
    },
    {
        id: "rand_city_comment_01",
        lines: [
            "最近はAIが何でもやってくれるから便利ですけど…",
            "少し寂しい気もしますね。",
        ],
    },
     {
        id: "rand_simple_greeting_01",
        lines: [
            "こんにちは。",
        ],
    },
     {
        id: "rand_simple_comment_02",
        lines: [
            "今日も一日頑張ろう。"
        ],
    },
    // ランダムに表示したい対話エントリーをここに追加...
];
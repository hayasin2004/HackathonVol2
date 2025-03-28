import { resolve } from "path"
import  {useState} from "react"


const register = () => {
        const[userName,setUserName] = useState("")
        const[email,setEmail] = useState("")
        const[password,setPassword] = useState("")
        const [confirmPassword, setConfirmPassword] = useState("")
        const [isLoading, setIsLoading] = useState(false)
        const [error, setError] = useState<string | null>(null)
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            setError(null)

            // 基本的なバリデーション
            if (password !== confirmPassword) {
            setError("パスワードが一致しません")
            return
            }

            if (password.length < 6) {
            setError("パスワードは6文字以上である必要があります")
            return
            }

            setIsLoading(true)

            try {
                // ここに実際の登録ロジックを実装
                // 例: const { data, error } = await supabase.auth.signUp({ email, password })
          
                await new Promise((resolve) => setTimeout(resolve, 1000))
          
                console.log("登録成功:", { userName, email, password })
              } catch (err) {
                setError(err instanceof Error ? err.message : "登録に失敗しました")
              } finally {
                setIsLoading(false)
              }
            }
        
    return(
        <>
        <form>
            <div>
                <h3>userName</h3>
                    <input
                        id="userName"
                        type="userName"
                        placeholder="山田 太郎"
                        value={userName}
                        disabled={isLoading}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                    />
            </div>
            <div>
                <h3>mailadress</h3>
                    <input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    value={email}
                    disabled={isLoading}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
            </div>
            <div>
                <h3>Password</h3>
                <input
                    id="password"
                    type="password"
                    placeholder="6文字以上"
                    value={password}
                    disabled={isLoading}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
            </div>
            <div>
                <h3>Password（確認）</h3>
                <input
                    id="confirm-password"
                    type="password"
                    placeholder="パスワードを再入力"
                    value={confirmPassword}
                    disabled={isLoading}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
            </div>
            <button type="submit" disabled = {isLoading}>
                {isLoading ? "登録中..." : "アカウント作成中"}
            </button>

            </form>
        </>
    )
}


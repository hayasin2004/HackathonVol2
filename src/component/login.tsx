import {useState} from "react"

const loginForm = ({}) => {
    const[userName,setUserName] = useState("")
    const[email,setEmail] = useState("")
    const[password,setPassword] = useState("")

    const handleSubmit = (e:React.FormEvent) => {
        e.preventDefault()
        console.log('ログイン情報', {userName,email,password})

    }
    


    return(
        <>
        <form onSubmit={handleSubmit}>
            <h3>userName</h3>
            <input
              id="userName"
              type="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <h3>mailadress</h3>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <h3>Password</h3>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">ログイン</button>
            <div className="px-8 pb-8 text-center text-sm">
                アカウントをお持ちでない場合は
                <a href="/register" className="text-primary hover:underline font-medium">
                    {" "}
                    新規登録
                </a>{" "}
                してください
            </div>
        </form>

        </>
    )
}

export default loginForm
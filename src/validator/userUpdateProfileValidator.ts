import {propsPlayerType} from "@/types/Player";

type UserUpdateProfileProps = {
    propsData:propsPlayerType;
    email: string|undefined;
    username: string|undefined;
    description: string|undefined|null;
    password: string|undefined;
    setEmail: (value: string) => void;
    setUsername: (value: string) => void;
    setPassword: (value: string) => void;
    setDescription: (value: string) => void;
};

// もしアップデートするときに初期値変更後に空の文字列に返ったときの処理
const userUpdateProfileValidator = async (props: UserUpdateProfileProps) =>{

    const {propsData,
        username,setUsername,
        email,setEmail,
        password,setPassword,
        description,setDescription} = props
    
    if(username == ''){
        // ユーザーのインプットが空
        console.log("usernameのインプットが空")
        setUsername(propsData.detailPlayer?.username!)
    }
    if(email == ''){
        setEmail(propsData.detailPlayer?.email!)
    }
    if(password == ''){
        setPassword(propsData.detailPlayer?.password!)
    }
    if(description == ''){
        setDescription(propsData.detailPlayer?.description!)
    }

}

export default userUpdateProfileValidator;
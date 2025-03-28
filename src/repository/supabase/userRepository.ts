import {createClient} from "@/utils/supabase/component";


export const supabaseSignIn = async (email: string,password : string) => {
    const supabase = createClient()
    console.log("ここまで来てるの")
    const {error} = await supabase.auth.signUp({email,password})
    if (error){
        console.error("signIn error : "+error)
    }
}


export const supabaseLogin = async (email: string,password : string) => {
    const supabase = createClient()
    const {error} = await  supabase.auth.signInWithPassword({email, password})
    if (error) {
        console.error("LogIn error : " + error)
    }
}

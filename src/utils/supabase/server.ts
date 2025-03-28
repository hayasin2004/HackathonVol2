import {createServerClient} from '@supabase/ssr'
import {cookies} from 'next/headers'

const createClient = async () => {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABESE_URL!,
        process.env.NEXT_PUBLIC_SUPABESE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({name, value, options}) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch (err) {
                        console.log("cookieError" + err)
                    }
                }
            }
        }
    )
}

export default createClient
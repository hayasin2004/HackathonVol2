'use client'

import { useState } from 'react'
import {supabase} from '@/lib/supabase'

const saveImage = () => {
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleUpload = async () => {
        try {
            setUploading(true)
            if (!file) {
                return
            }

            const { data, error } = await supabase.storage
                .from('hackathon2-picture-storage')
                .upload(`public/${file.name}`, file)

            if (error) throw JSON.stringify(error)
            if (data){
                setUploading(false)
            }
        } catch (e) {
            throw JSON.stringify(e)
        }
    }

    return (
        <div>
            <h1>File Upload</h1>
            <input type='file' onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'uploading...' : 'upload'}
            </button>
        </div>
    )
}

export default saveImage

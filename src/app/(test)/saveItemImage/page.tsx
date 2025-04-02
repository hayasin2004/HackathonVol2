'use client'

import {useState} from 'react'
import {supabase} from '@/lib/supabase'
import prisma from "@/lib/prismaClient";
import {ItemIConCreate} from "@/repository/prisma/adminItemRepository";

const CreateItem = () => {
    const [file, setFile] = useState<File | null>(null)
    const [itemName, setItemName] = useState<string>('')
    const [uploading, setUploading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        try {
            setUploading(true)

            // Step 1: 画像をSupabase Storageに保存
            if (!file) {
                throw new Error('画像が選択されていません')
            }
            console.log('ここまで来た！！！！あｓｄｆ！')

            const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${file.name}`
            const {data: imageData, error: imageError}  = await supabase.storage
                .from('hackathon2-picture-storage')
                .upload(imageUrl, file)

            if (imageError) throw imageError

            console.log('ここまで来た１１１１１１１１１１１１１')

            // Step 2: Itemモデルにデータを保存
            const newItem = await ItemIConCreate(itemName , imageUrl)


            console.log('ここまで来た！！！！！' , newItem)
        } catch (err) {
            console.log(err)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <h1>アイテム作成</h1>
            <input
                type='text'
                placeholder='アイテム名を入力'
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
            />
            <input type='file' onChange={handleFileChange}/>
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? '保存中...' : '保存'}
            </button>
        </div>
    )
}

export default CreateItem
'use client'

import {useEffect, useState} from 'react'
import {supabase} from '@/lib/supabase'
import prisma from "@/lib/prismaClient";
import {ItemIConCreate} from "@/repository/prisma/adminItemRepository";
import {itemList} from "@/repository/prisma/ClientItemRepository";
import {defaultItem} from "@/types/defaultItem";

const CreateItem = () => {
    const [file, setFile] = useState<File | null>(null)
    // アイテム用useState
    const [itemName, setItemName] = useState<string>('')
    const [itemDescription, setItemDescription] = useState<string>('')
    const [uploading, setUploading] = useState(false)
    const [itemListArray, setItemListArray] = useState<defaultItem[] | null>([])
    console.log(itemListArray)
    const [itemPrimaryKey, setItemPrimaryKey] = useState<number | null>(null)

    const handleChange = (event) => {
        const selectedId = event.target.value === "null" ? null : event.target.value;
        setItemPrimaryKey(selectedId);
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    useEffect(() => {
        const findItem = async () => {
            const data = await itemList()
            setItemListArray(data)
        }
        findItem()
    }, []);

    const handleUpload = async () => {
        try {
            setUploading(true)

            // Step 1: 画像をSupabase Storageに保存
            if (!file) {
                throw new Error('画像が選択されていません')
            }
            console.log('ここまで来た！！！！あｓｄｆ！')

            const {data: imageData, error: imageError} = await supabase.storage
                .from('hackathon2-picture-storage')
                .upload(`public/${file.name}`, file)

            if (imageError) throw imageError

            console.log('ここまで来た１１１１１１１１１１１１１')
            const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hackathon2-picture-storage/public/${file.name}`;
            console.log('画像URL:', imageUrl);

            // Step 2: Itemモデルにデータを保存
            const newItem = await ItemIConCreate(itemName,itemDescription, imageUrl)


            console.log('ここまで来た！！！！！', newItem)
        } catch (err) {
            console.log(err)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <div style={{width:"500px" , height:"200px" ,background:"#eee"}}>
                <h1>DefalutItemListの作成</h1>
                <p>石、木などクラフトで作成されないやつはこのグレーのエリアで</p>
                <input
                    type='text'
                    placeholder='アイテム名を入力'
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                />
                <input
                    type='text'
                    placeholder='アイテム説明を入力'
                    value={itemName}
                    onChange={(e) => setItemDescription(e.target.value)}
                />
                <button onClick={handleUpload} disabled={uploading}>
                    {uploading ? '保存中...' : '保存'}
                </button>
            </div>

        </div>
    )
}

export default CreateItem
import React from 'react';
import {propsPlayerDetailFollowType} from "@/types/Player";
import {useSession} from "next-auth/react";

const UpdateButton: React.FC<propsPlayerDetailFollowType | null> = (props) => {
    const {data: session} = useSession();
    console.log("Detail session"+JSON.stringify(session));
    console.log("Detail props"+JSON.stringify(props));
    return (
        <div>
            <button>
                新しい情報に変更する
            </button>
        </div>
    );
};

export default UpdateButton;
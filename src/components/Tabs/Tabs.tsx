"use client"
import React, {useState} from 'react';


export const  Tabs =  () => {
    const[activeTabs,setActiveTabs] = useState('01')


    const handleTabClick = (tab:string) => {
        setActiveTabs(tab);
    }
    return (
        <div>
            <div>
            </div>
            <div className="tab">
                <ul className="tab__menu">
                    <li
                        className={`tab__menu-item ${activeTabs === "01" ? "is-active" : ""}`}
                        onClick={() => handleTabClick("01")}
                    >
                        フォロ一覧
                    </li>
                    <li
                        className={`tab__menu-item ${activeTabs === "02" ? "is-active" : ""}`}
                        onClick={() => handleTabClick("02")}
                    >
                        フォロワー一覧
                    </li>
                </ul>
                <div className="tab__panel">
                    {activeTabs === "01" && (
                        <div className="tab__panel-box tab__panel-box001">
                            <p> aaaaa</p>
                        </div>
                    )}
                    {activeTabs === "02" && (
                        <div className="tab__panel-box tab__panel-box002">
                            <p> bbbbb</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Tabs;
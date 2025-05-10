import {useEffect,useState} from "react";
import styles from "./page.module.css";


const LoadingScreen = ({message = '読み込み中'}) => {
    const [loading, setLoading] = useState<string>('');
    useEffect(() => {
        const interval = setInterval(() => {
            setLoading((prev:string) => prev.length >= 3 ? '' : prev + '.')
        },400);
        return () => clearInterval(interval);
    }, []);
    return (
        <div
            style={{
                backgroundImage: "url('/canvahiru.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className={styles.div}>
                {message} {loading}
            </div>
        </div>
    );
};

export default LoadingScreen;
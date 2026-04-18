import { useEffect, useState } from "react";
import "./SplashScreen.css";

export default function SplashScreen({ onFinished }) {
    const [fade, setFade] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFade(true);
            setTimeout(onFinished, 500); // 0.5s fade out keyin tugatish
        }, 2000); // 2s ko'rsatish
        return () => clearTimeout(timer);
    }, [onFinished]);

    return (
        <div className={`splash-screen ${fade ? 'fade-out' : ''}`}>
            <div className="splash-logo">
                <div className="logo-circle">
                    <span className="logo-text">A</span>
                </div>
                <h1 className="logo-name">ATHENA</h1>
                <div className="loader-line"></div>
            </div>
        </div>
    );
}

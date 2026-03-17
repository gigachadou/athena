import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import { useEffect, useState } from "react";

export default function ProtectedRoot() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        async function getUserData() {
            try {
                const local = localStorage.getItem("loginConf");
                if (!local) {
                    setUserData(null);
                    navigate("/login");
                };

                const { user } = JSON.parse(local);
                if (!user?.id) {
                    setUserData(null);
                    navigate("/login");
                };

                const response = await fetch(`http://localhost:3000/users/${user.id}`);

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem("loginConf");
                        navigate("/login")
                        throw new Error("Session expired");
                    };

                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Server error: ${response.status}`);
                }

                const data = await response.json();
                setUserData(data);
            } catch (err) {
                console.error("getUserData failed:", err);

                if (err.message.includes("Session expired") || err.message.includes("Unauthorized")) {
                    localStorage.removeItem("loginConf");
                };
                setUserData(null);
                navigate("/login");
                alert("Error at auto authentication");
            };
        };
        getUserData();
    }, []);
    console.log(userData);
    return (
        <div>
            {userData && (<>
                <Header />
                <Outlet context={{ userData, setUserData }} />
            </>)}
        </div>
    );
};
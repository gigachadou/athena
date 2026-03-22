import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import checkUserExistance from "./utils/checkUserExistance";

export default function ProtectedRoot() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        async function getUserData() {
            try {
                const locale = localStorage.getItem("loginConf");
                if (!locale) throw new Error("No data for auto-login");

                const { user, accessToken } = JSON.parse(locale);
                console.log("Access Token: " + accessToken);
                await checkUserExistance(accessToken);

                if (!user?.id) throw new Error("Invalid data for auto-login")

                const response = await fetch(`http://localhost:3000/users/${user.id}`);

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Session expired");
                    };

                    const errorData = await response.json()
                    throw new Error(errorData.message || `Server error: ${response.status}`);
                }

                const data = await response.json();
                setUserData(data);
            } catch (err) {
                localStorage.removeItem("loginConf");
                setUserData(null);
                navigate("/login");
                console.warn(err.message);
            };
        };
        getUserData();
    }, []);
    return (
        <div>
            {userData && (<>
                <Header />
                <Outlet context={{ userData, setUserData }} />
            </>)}
        </div>
    );
};
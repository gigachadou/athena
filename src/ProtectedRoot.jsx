import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./utils/authService";

export default function ProtectedRoot() {
    const [userData, setUserData] = useState(null);
    const [triggerWindow, setTriggerWindow] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        async function getUserData() {
            try {
                const user = await getCurrentUser();

                if (!user) {
                    throw new Error("No session found");
                }

                setUserData({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    status: user.status,
                    posts: user.posts,
                    bio: user.bio,
                    followers: user.followers,
                    followings: user.followings,
                    avatar: user.avatar
                });
            } catch (err) {
                setUserData(null);
                navigate("/login");
            };
        };
        getUserData();
    }, [triggerWindow, navigate]);
    return (
        <div>
            {userData && (<>
                <Header />
                <Outlet context={{ userData, setUserData, setTriggerWindow }} />
            </>)}
        </div>
    );
};
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

export default function ProtectedRoot() {
    const [userData, setUserData] = useState(null);
    const [triggerWindow, setTriggerWindow] = useState(0);
    const navigate = useNavigate();

    console.log(userData);

    useEffect(() => {
        async function getUserData() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) throw new Error("No session found");

                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();

                if (error || !data) throw new Error("User not found in database");

                setUserData({
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    status: data.status,
                    posts: data.posts,
                    bio: data.bio,
                    followers: data.followers,
                    followings: data.followings,
                    avatar: data.avatar
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

// {
//       "email": "test@g.com",
//       "password": "$2a$10$7NdLGm2KTO9mNVo674k/.uzi0bVkBf4dpPyjyAmtMz7wRlovAw13e",
//       "name": "test",
//       "status": "user",
//       "posts": [
//         "test@g.com-1773664763871",
//         "test@g.com-1774072557624"
//       ],
//       "likes": [],
//       "comments": [
//         {
//           "id": "1-1773920764162",
//           "post": "test@g.com-1773664763871",
//           "text": "sthsth"
//         }
//       ],
//       "bio": "",
//       "followers": [
//         2
//       ],
//       "followings": [],
//       "id": 1,
//       "avatar": }
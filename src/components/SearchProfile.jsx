import { useEffect, useState } from "react";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import "../styles/searchresultuser.css"
import PostCard from "./PostCard";
import getPostsByIds from "../utils/getPostsByIds";
import following from "../utils/following";
import unfollow from "../utils/unfollow";
import addNote from "../utils/addNotification";
import { supabase } from "../utils/supabaseClient";

function SearchProfile() {
    const [data, setData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [stateFollow, setStateFollow] = useState(false);
    const [notification, setNotification] = useState(null);
    const [posts, setPosts] = useState([]);
    const { usersID } = useParams();
    let navigate = useNavigate();
    const { userData } = useOutletContext();
    useEffect(() => {
        if (currentUser && data) {
            setStateFollow(currentUser.followings.includes(data.id));
        }
    }, [currentUser, data]);

    useEffect(() => {
        async function getUsers(id) {
            try {
                let current = userData.id;

                const { data: current_user_db, error: currentError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', current)
                    .single();

                const { data: profile_user, error: profileError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (currentError || profileError) throw new Error("Couldn't get user data");

                setData(profile_user);
                setCurrentUser(current_user_db);
            } catch (err) {

            }
        }
        getUsers(usersID)
    }, [usersID, userData])

    useEffect(() => {
        (async function () {
            if (data) {
                const response = await getPostsByIds(data.posts);
                setPosts(response);
            };
        })();
    }, [data]);

    if (!data) {
        return <div>Loading...</div>
    };
    // faqat funksiyalarni handlerga ko'chirdim, error handling u-n! Boshqa joyi o'zgarmagan
    async function followHandler(currUserId, dataId, setStateFollow) {
        try {
            following(currUserId, dataId, setStateFollow);
            addNote("New Follower", `You have a new follower`, dataId)

            setNotification({
                title: "Now you follow this user.",
                text: "Posts start to appear in your feed from now on."
            });

            setTimeout(() => {
                setNotification(null);
            }, 5000);
        } catch (error) {
            setNotification({
                title: "Operation failed.",
                text: "Please, try again later"
            });
        };
    };

    async function unfollowHandler(currUserId, dataId, setStateFollow) {
        try {
            unfollow(currUserId, dataId, setStateFollow);
            setNotification({
                title: "You unfollowed this user.",
                text: "Operation was succesful"
            });

            // 5 sekunddan keyin yo‘qoladi
            setTimeout(() => {
                setNotification(null);
            }, 5000);
        } catch (error) { };
    };

    return <div className="profile-page">
        {notification && (
            <div className="toast">
                <div className="toast-title">{notification.title}</div>
                <div className="toast-text">{notification.text}</div>
            </div>
        )}
        <button onClick={() => navigate(-1)} className="back"><FaArrowLeft /></button>
        <div className="UserInfo">
            <div className="avatar">
                {!data?.avatar ? <FaUser color="black" /> : <img src={data.avatar} />}
            </div>
            <div className="bio">
                <div className="name">
                    <h2>{data?.name ? data.name : "UserName"}</h2>
                    <p>{data?.email ? data.email : "UserEmail"}</p>
                    <p>{data?.bio}</p>
                </div>
                <div className="following">
                    {stateFollow ? <button onClick={() => unfollowHandler(currentUser.id, data.id, setStateFollow)} className="unfollow-btn">Unfollow</button> : <button onClick={() => followHandler(currentUser.id, data.id, setStateFollow)} className="follow-btn">Follow</button>}
                </div>
            </div>
        </div>
        <div className="posts">
            {data?.posts?.[0] ? posts.map(e => <PostCard post={e} userData={data} key={e.id} />) : "No posts yet"}
        </div>
    </div>
}

export default SearchProfile
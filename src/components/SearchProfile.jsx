import { useEffect, useState } from "react";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom"
import "../styles/searchresultuser.css"
import PostCard from "./PostCard";
import getPostsByIds from "../utils/getPostsByIds";
import following from "../utils/following";
import unfollow from "../utils/unfollow";
import addNote from "../utils/addNotification";

function SearchProfile() {
    const [data, setData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [stateFollow, setStateFollow] = useState(false);
    const [notification, setNotification] = useState(null);
    const [posts, setPosts] = useState([]);
    const { usersID } = useParams();
    let navigate = useNavigate();

    useEffect(() => {
        if (currentUser && data) {
            setStateFollow(currentUser.followings.includes(data.id));
        }
    }, [currentUser, data]);

    useEffect(() => {
        async function getUsers(id) {
            let current = JSON.parse(localStorage.getItem("loginConf")).user.id;
            const current_user = await fetch(`http://localhost:3000/users/${current}`);
            const response = await fetch(`http://localhost:3000/users/${id}`);
            const data = await response.json();
            const userData = await current_user.json();
            setData(data);
            setCurrentUser(userData)
        }
        getUsers(usersID)
    }, [usersID])

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
            addNote("Succes Follow", "The follow operation was successful.", currUserId);
            addNote("New Follower", `You have new follower`, dataId)

            setNotification({
                title: "The follow operation was successful." ,
                text: "Thank you for staying with us"
            });

            // 5 sekunddan keyin yo‘qoladi
            setTimeout(() => {
                setNotification(null);
            }, 5000);
        } catch (error) { };
    };

    async function unfollowHandler(currUserId, dataId, setStateFollow) {
        try {
            unfollow(currUserId, dataId, setStateFollow);
            addNote("Succes unfollow", "The unfollow operation was successful.", currUserId)
            setNotification({
                title: "The unfollow operation was successful." ,
                text: "Thank you for staying with us"
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
        <button onClick={() => navigate("/profile")} className="back"><FaArrowLeft /></button>
        <div className="UserInfo">
            <div className="avatar">
                {!data?.avatar ? <FaUser color="black" /> : <img src={data.avatar} />}
            </div>
            <div className="bio">
                <div className="name">
                    <h2>{data?.name ? data.name : "UserName"}</h2>
                    <p>{data?.email ? data.email : "UserEmail"}</p>
                    <p>{data?.bio ? data.bio : "not bio yet"}</p>
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
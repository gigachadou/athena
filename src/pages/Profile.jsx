import { useEffect, useState } from "react"
import { FaCog, FaEdit, FaUser } from "react-icons/fa"
import "../styles/profile.css"
import EditModal from "../components/EditModal";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import getPostsByIds from "../utils/getPostsByIds";
import PostCard from "../components/PostCard";
import { BiPlus } from "react-icons/bi";

function Profile() {
    const { userData, setUserData } = useOutletContext();
    const [posts, setPosts] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [trigger, setTrigger] = useState(0);
    const [notification, setNotification] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        (async function () {
            if (userData) {
                const response = await getPostsByIds(userData.posts);
                // Sort by time: newest first
                const sorted = (response || []).sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
                setPosts(sorted);
            };
        })();
    }, [userData, trigger]);

    if (!userData) {
        return <div>Loading...</div>
    };

    return <div className="profile-page">
        <div className="profile-buttons">
            <button onClick={() => setIsOpen(true)}><FaEdit /></button>
            <button onClick={() => navigate("/settings")}><FaCog /></button>
        </div>
        {isOpen && <EditModal closeModal={setIsOpen} UserId={userData.id} data={setUserData} />}
        <div className="UserInfo">
            <div className="avatar">
                {!userData.avatar ? <FaUser /> : <img src={userData.avatar} alt="User avatar" />}
            </div>
            <div className="bio">
                <div className="name">
                    <h2>{userData.name}</h2>
                    <p>{userData.email}</p>
                    <p>{!userData.bio ? "" : userData.bio}</p>
                </div>
                <div className="following">
                    <button className="follow-btns" onClick={() => navigate(`/followers/followers/${userData.id}`)}>Followers: {userData.followers.length}</button>
                    <button className="follow-btns" onClick={() => navigate(`/followers/followings/${userData.id}`)}>Followings: {userData.followings.length}</button>
                </div>
            </div>
        </div>
        <div>
            <h2 className="posts-h2">Posts</h2>
            <BiPlus size={36} onClick={() => navigate("/addPost")} />
        </div>
        <div className="posts">
            {!userData.posts?.[0] ? <Link to={"/addPost"}>Create your first post</Link>
                : posts.map(e => <PostCard post={e} key={e.id} setTrigger={setTrigger} />)}
        </div>
    </div>
};

export default Profile;
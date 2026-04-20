import { useEffect, useState } from "react"
import { FaCog, FaEdit, FaUser, FaBookmark, FaTh, FaCoins } from "react-icons/fa"
import "../styles/profile.css"
import EditModal from "../components/EditModal";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import getPostsByIds from "../utils/getPostsByIds";
import PostCard from "../components/PostCard";
import CreatePostInline from "../components/CreatePostInline";

function Profile() {
    const { userData, setUserData } = useOutletContext();
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [isOpen, setIsOpen] = useState(false);
    const [trigger, setTrigger] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        (async function () {
            if (userData) {
                if (activeTab === 'posts') {
                    const response = await getPostsByIds(userData.posts);
                    const sorted = (response || []).sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
                    setPosts(sorted);
                } else if (activeTab === 'saved') {
                    const response = await getPostsByIds(userData.saved_posts);
                    const sorted = (response || []).sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
                    setSavedPosts(sorted);
                }
            };
        })();
    }, [userData, trigger, activeTab]);

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
                <div className="name-row">
                    <h2>{userData.name}</h2>
                    <div className="coin-badge">
                        <FaCoins /> <span>{userData.coins || 0} A-Coins</span>
                    </div>
                </div>
                <p className="user-email">{userData.email}</p>
                <p className="user-bio">{!userData.bio ? "" : userData.bio}</p>
                <div className="following">
                    <button className="follow-btns" onClick={() => navigate(`/followers/followers/${userData.id}`)}>Followers: <strong>{userData.followers.length}</strong></button>
                    <button className="follow-btns" onClick={() => navigate(`/followers/followings/${userData.id}`)}>Followings: <strong>{userData.followings.length}</strong></button>
                </div>
            </div>
        </div>

        {activeTab === 'posts' && (
            <CreatePostInline userData={userData} onPostCreated={() => setTrigger(prev => prev + 1)} />
        )}

        <div className="profile-tabs">
            <button 
                className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
            >
                <FaTh /> Posts
            </button>
            <button 
                className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => setActiveTab('saved')}
            >
                <FaBookmark /> Saved
            </button>
        </div>

        <div className="posts-header-action">
            <h2 className="posts-h2">{activeTab === 'posts' ? 'My Posts' : 'Saved Posts'}</h2>
        </div>

        <div className="posts">
            {activeTab === 'posts' ? (
                !userData.posts?.[0] ? (
                    <div className="no-posts-msg">
                        No posts yet. Start sharing!
                    </div>
                ) : posts.map(e => <PostCard post={e} key={e.id} setTrigger={setTrigger} />)
            ) : (
                !userData.saved_posts?.[0] ? (
                    <div className="no-posts-msg">No saved posts yet.</div>
                ) : savedPosts.map(e => <PostCard post={e} key={e.id} setTrigger={setTrigger} />)
            )}
        </div>
    </div>
};

export default Profile;

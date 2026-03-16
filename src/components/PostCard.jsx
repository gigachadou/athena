import { FaComment, FaEye, FaHeart, FaUser } from 'react-icons/fa';
import '../styles/PostCard.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [serverError, setServerError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        async function getUserInfo() {
            const res = await fetch(`http://localhost:3000/users/${post.userId}`);
            if (!res.ok) {
                setServerError("User not found");
                return
            }
            const data = await res.json();
            setUserInfo(data);
        };
        getUserInfo();
    }, [post]);

    const timeAgo = post.createdAt
        ? new Date(post.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        : 'just now';

    return (
        <div className="post-card" onClick={() => navigate(`/posts/${post.id}`)}>
            <div className="post-header">
                <div className="user-info">
                    <div className="avatar">
                        {!userInfo?.avatar ? <FaUser/> : <img src={userInfo.avatar} alt='user avatar'/>}
                    </div>
                    <div className="meta">
                        <span className="username">{!userInfo?.name ? "User" : userInfo.name}</span>
                        <span className="timestamp"> {timeAgo}</span>
                    </div>
                </div>
                <button className="more-btn">⋯</button>
            </div>

            <div className="post-content">
                {post.header && (
                    <h2 className="post-title">{post.header}</h2>
                )}
                <p className="post-text">{post.text}</p>
                {post.media && <img src={post.media[0]} alt='Media'/>}
            </div>

            <div className="post-footer">
                <div className="action-btns">
                    <button className="action like">
                        <span className="icon"><FaHeart /></span>
                        <span>{post.likes.length}</span>
                    </button>

                    <button className="action comment">
                        <span className="icon"><FaComment /></span>
                        <span>{post.comments.length}</span>
                    </button>

                    <button className="action view">
                        <span className="icon"><FaEye /></span>
                        <span>{post.views.toLocaleString()}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
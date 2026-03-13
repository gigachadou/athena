import { FaComment, FaEye, FaHeart, FaUser } from 'react-icons/fa';
import '../styles/PostCard.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [serverError, setServerError] = useState(null);
    const {
        header,
        text,
        likes,
        comments,
        views,
        id,
        userId,
        createdAt,
    } = post;

    const navigate = useNavigate();

    useEffect(() => {
        async function getUserInfo() {
            const res = await fetch(`http://localhost:3000/users/${userId}`);
            if (!res.ok) {
                setServerError("User not found");
                return
            }
            const data = await res.json();
            setUserInfo(data);
        };
        getUserInfo();
    }, [post]);

    const timeAgo = createdAt
        ? new Date(createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        : 'just now';

    return (
        <div className="post-card" onClick={() => navigate(`/posts/${id}`)}>
            <div className="post-header">
                <div className="user-info">
                    <div className="avatar">
                        <img src={!userInfo?.avatar ? <FaUser /> : userInfo.avatar} alt="" />
                    </div>
                    <div className="meta">
                        <span className="username">{!serverError ? userInfo.name : "User not found"}</span>
                        <span className="timestamp"> {timeAgo}</span>
                    </div>
                </div>
                <button className="more-btn">⋯</button>
            </div>

            <div className="post-content">
                {header && header !== "1" && (
                    <h2 className="post-title">{header}</h2>
                )}
                <p className="post-text">{text}</p>
            </div>

            <div className="post-footer">
                <div className="action-btns">
                    <button className="action like">
                        <span className="icon"><FaHeart /></span>
                        <span>{likes.length}</span>
                    </button>

                    <button className="action comment">
                        <span className="icon"><FaComment /></span>
                        <span>{comments.length}</span>
                    </button>

                    <button className="action view">
                        <span className="icon"><FaEye /></span>
                        <span>{views.toLocaleString()}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
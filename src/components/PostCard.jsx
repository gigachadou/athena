import { FaUser } from 'react-icons/fa';
import '../styles/PostCard.css';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { deletePost } from '../utils/postActions/deletePost';
import addNote from '../utils/addNotification';

const PostCard = ({ post, setTrigger }) => {
    const [ownerInfo, setOwnerInfo] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [moreBtn, setMoreBtn] = useState(false);
    const { userData } = useOutletContext();

    const navigate = useNavigate();

    function handlePostNavigation() {
        if (!post?.id) return;
        navigate(`/posts/${post.id}`);
    }

    useEffect(() => {
        async function getUserInfo() {
            const res = await fetch(`http://localhost:3000/users/${post.userId}`);
            if (!res.ok) {
                setServerError("User not found");
                return
            }
            const data = await res.json();
            setOwnerInfo(data);
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

    async function handleDelete(postId) {
        try {
            await deletePost(postId, userData.id);
            addNote("Post got removed successfully", "", userData.id);
            if (setTrigger) setTrigger(prev => ++prev);
        } catch (error) {
            console.error(error.message);
            setServerError(error.message);
        };
    };

    return (
        <div className="post-card">
            {ownerInfo && (<><div className="post-header" onClick={() => userData.id === ownerInfo.id ? navigate("/profile") : navigate(`/searchresultusers/${ownerInfo.id}`)}>
                <div className="user-info">
                    <div className="avatar">
                        {!ownerInfo?.avatar ? <FaUser /> : <img src={ownerInfo.avatar} alt='user avatar' />}
                    </div>
                    <div className="meta">
                        <span className="username">{!ownerInfo?.name ? "User" : ownerInfo.name}</span>
                        <span className="timestamp"> {timeAgo}</span>
                    </div>
                </div>
                <button
                    className="more-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setMoreBtn(prev => !prev);
                    }}
                >
                    ⋯
                </button>
                <div
                    className="post-more-btn"
                    style={{ display: moreBtn ? "block" : "none" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {ownerInfo.id === userData.id && <div className="post-more-btn-forOwner">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!post?.id) return;
                                navigate(`/editPost/${post.id}`);
                            }}
                        >
                            Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(post.id) }}>Delete</button>
                    </div>}
                </div>
            </div>

                <div className="post-content" onClick={handlePostNavigation}>
                    {post.header && (
                        <h2 className="post-title">{post.header}</h2>
                    )}
                    <p className="post-text">{post.text}</p>
                    {post.media?.length ? <img src={post.media[0]} alt='Media' /> : <></>}
                </div> </>)}


        </div>
    );
};

export default PostCard;

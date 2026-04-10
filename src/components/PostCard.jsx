import { FaUser } from 'react-icons/fa';
import '../styles/PostCard.css';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { deletePost } from '../utils/postActions/deletePost';
import addNote from '../utils/addNotification';
import { supabase } from '../utils/supabaseClient';
import { FaHeart, FaComment, FaEye } from 'react-icons/fa6';
import actionLike from '../utils/postActions/actionLike';
import actionDislike from '../utils/postActions/actionDislike';

const PostCard = ({ post, setTrigger,  }) => {
    const [ownerInfo, setOwnerInfo] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [moreBtn, setMoreBtn] = useState(false);
    const { userData } = useOutletContext();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

    const navigate = useNavigate();

    useEffect(() => {
        setIsLiked((post.likes || []).includes(userData.id));
        setLikesCount(post.likes?.length || 0);
    }, [post.likes, userData.id]);

    async function toggleLike(e) {
        e.stopPropagation();
        try {
            if (isLiked) {
                await actionDislike(post.id, userData.id);
                setIsLiked(false);
                setLikesCount(prev => prev - 1);
            } else {
                await actionLike(post.id, userData.id);
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
            }
        } catch (error) {
            console.error("Like toggle failed:", error.message);
        }
    }

    function handlePostNavigation() {
        if (!post?.id) return;
        navigate(`/posts/${post.id}`);
    }

    useEffect(() => {
        async function getUserInfo() {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', post.userid)
                .single();

            if (error) {
                setServerError("User not found");
                return
            }
            setOwnerInfo(data);
        };
        getUserInfo();
    }, [post]);

    const timeAgo = post.createdat
        ? new Date(post.createdat).toLocaleString('en-US', {
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
                </div>
                <div className="post-stats">
                    <div
                        className="action like"
                        onClick={toggleLike}
                        style={isLiked ? { color: "#e41e3f" } : {}}
                    >
                        <span className="icon">
                            <FaHeart /> {likesCount}
                        </span>
                    </div>
                    <div className="action comment" onClick={handlePostNavigation}>
                        <span className="icon">
                            <FaComment /> {post.comments?.length || 0}
                        </span>
                    </div>
                    <div className="action view" onClick={handlePostNavigation}>
                        <span className="icon">
                            <FaEye /> {post.views || 0}
                        </span>
                    </div>
                </div>
            </>)}


        </div>
    );
};

export default PostCard;

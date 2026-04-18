import { FaUser, FaVolumeMute, FaVolumeUp, FaEllipsisH } from 'react-icons/fa';
import '../styles/PostCard.css';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { deletePost } from '../utils/postActions/deletePost';
import addNote from '../utils/addNotification';
import { supabase } from '../utils/supabaseClient';
import { FaHeart, FaComment, FaEye } from 'react-icons/fa6';
import actionLike from '../utils/postActions/actionLike';
import actionDislike from '../utils/postActions/actionDislike';
import { actionView } from '../utils/postActions/actionView';
import following from '../utils/following';
import unfollow from '../utils/unfollow';

const PostCard = ({ post, setTrigger }) => {
    const { userData, setUserData } = useOutletContext();
    const [ownerInfo, setOwnerInfo] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [isLiked, setIsLiked] = useState(post.likes?.includes(userData?.id));
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [viewCount, setViewCount] = useState(post.views || 0);
    const [isMuted, setIsMuted] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFollowing, setIsFollowing] = useState(userData?.followings?.includes(post.userid));
    const videoRef = useRef(null);

    const navigate = useNavigate();

    const handleNext = (e) => {
        e.stopPropagation();
        if (currentSlide < post.media.length - 1) setCurrentSlide(prev => prev + 1);
    }
    const handlePrev = (e) => {
        e.stopPropagation();
        if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
    }

    const handleFollow = async (e) => {
        e.stopPropagation();
        if (!userData || userData.id === post.userid) return;
        try {
            if (isFollowing) {
                await unfollow(userData.id, post.userid, setIsFollowing);
                setUserData(prev => ({ ...prev, followings: prev.followings.filter(id => id !== post.userid) }));
            } else {
                await following(userData.id, post.userid, setIsFollowing);
                setUserData(prev => ({ ...prev, followings: [...prev.followings, post.userid] }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const viewedPosts = JSON.parse(sessionStorage.getItem('viewed_posts') || '[]');
        const timer = setTimeout(() => {
            if (!viewedPosts.includes(post.id) && userData?.id !== post.userid) {
                actionView(post.id).then(() => {
                    viewedPosts.push(post.id);
                    sessionStorage.setItem('viewed_posts', JSON.stringify(viewedPosts));
                    setViewCount(prev => prev + 1);
                }).catch(() => {});
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [post.id, post.userid, userData?.id]);

    useEffect(() => {
        setIsLiked((post.likes || []).includes(userData.id));
        setLikesCount(post.likes?.length || 0);
        setViewCount(post.views || 0);
    }, [post.likes, post.views, userData.id]);

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
        } catch (error) {}
    }

    useEffect(() => {
        async function getUserInfo() {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', post.userid)
                .single();
            if (!error) setOwnerInfo(data);
        };
        getUserInfo();
    }, [post]);

    const timeAgo = post.createdat ? new Date(post.createdat).toLocaleDateString() : 'just now';

    async function handleDelete() {
        if (!window.confirm("Haqiqatdan ham ushbu postni o'chirmoqchimisiz?")) return;
        try {
            await deletePost(post.id, userData.id);
            addNote("Post o'chirildi", "", userData.id);
            if (setTrigger) setTrigger(prev => ++prev);
            setShowMenu(false);
        } catch (error) {
            setServerError(error.message);
        };
    }

    return (
        <div className="post-card">
            {ownerInfo && (
                <>
                    <div className="post-header">
                        <div className="user-info" onClick={() => navigate(userData.id === ownerInfo.id ? "/profile" : `/searchresultusers/${ownerInfo.id}`)}>
                            <div className="avatar">
                                {!ownerInfo?.avatar ? <FaUser /> : <img src={ownerInfo.avatar} alt='avatar' />}
                            </div>
                            <div className="user-info-text">
                                <h3 className="user-name">{ownerInfo?.name || "User"}</h3>
                                {userData && userData.id !== post.userid && (
                                    <button 
                                        className={`post-follow-btn ${isFollowing ? 'following' : ''}`} 
                                        onClick={handleFollow}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>
                            <span className="timestamp">{timeAgo}</span>
                        </div>
                        <button className="more-btn" onClick={() => setShowMenu(true)}>
                            <FaEllipsisH />
                        </button>
                    </div>

                    {showMenu && (
                        <div className="post-menu-overlay" onClick={() => setShowMenu(false)}>
                            <div className="post-menu-content" onClick={e => e.stopPropagation()}>
                                {ownerInfo.id === userData.id ? (
                                    <>
                                        <button className="menu-item edit" onClick={() => navigate(`/editPost/${post.id}`)}>Edit Post</button>
                                        <button className="menu-item delete" onClick={handleDelete}>Delete Post</button>
                                    </>
                                ) : (
                                    <button className="menu-item">Report Post</button>
                                )}
                                <button className="menu-item cancel" onClick={() => setShowMenu(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className="post-content">
                        {post.header && <h2 className="post-title">{post.header}</h2>}
                        <p className="post-text">{post.text}</p>
                        
                        {post.media?.length > 0 && (
                            <div className="media-container carousel-container" style={{ position: "relative" }}>
                                {post.media[currentSlide].match(/\.(mp4|webm|ogg|mov)$/i) || post.media[currentSlide].startsWith("data:video/") ? (
                                    <>
                                        <video 
                                            ref={videoRef}
                                            src={post.media[currentSlide]} 
                                            autoPlay 
                                            muted={isMuted} 
                                            loop 
                                            playsInline
                                            className="post-media" 
                                        />
                                        <button 
                                            className="sound-toggle" 
                                            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                                            title={isMuted ? "Unmute" : "Mute"}
                                        >
                                            {isMuted ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
                                        </button>
                                    </>
                                ) : (
                                    <div className="carousel-wrapper">
                                        <img src={post.media[currentSlide]} alt="Media" className="post-media" />
                                        
                                        {post.media.length > 1 && (
                                            <>
                                                {currentSlide > 0 && <button className="carousel-btn prev" onClick={handlePrev}>‹</button>}
                                                {currentSlide < post.media.length - 1 && <button className="carousel-btn next" onClick={handleNext}>›</button>}
                                                
                                                <div className="carousel-dots">
                                                    {post.media.map((_, index) => (
                                                        <span key={index} className={`dot ${index === currentSlide ? 'active' : ''}`}></span>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="post-stats">
                        <div className="action like" onClick={toggleLike} style={isLiked ? { color: "#e41e3f" } : {}}>
                            <FaHeart /> <span>{likesCount}</span>
                        </div>
                        <div className="action comment" onClick={() => navigate(`/posts/${post.id}`)}>
                            <FaComment /> <span>{post.comments?.length || 0}</span>
                        </div>
                        <div className="action view">
                            <FaEye /> <span>{viewCount}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PostCard;

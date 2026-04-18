import { useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FaHeart, FaComment, FaMusic, FaUser, FaVolumeMute, FaVolumeUp, FaPaperPlane, FaTimes, FaShare } from "react-icons/fa";
import actionLike from "../utils/postActions/actionLike";
import actionDislike from "../utils/postActions/actionDislike";
import actionComment from "../utils/postActions/actionComment";
import following from "../utils/following";
import unfollow from "../utils/unfollow";
import "../styles/shorts.css";

const ShortItem = ({ post, userData }) => {
    const { setUserData } = useOutletContext();
    const videoRef = useRef(null);
    const [isLiked, setIsLiked] = useState(post.likes?.includes(userData?.id));
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [author, setAuthor] = useState(null);
    const [isMuted, setIsMuted] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState(post.comments || []);
    const [progress, setProgress] = useState(0);
    const [showHeart, setShowHeart] = useState(false);
    const [currentImg, setCurrentImg] = useState(0);
    const [commentAuthors, setCommentAuthors] = useState({});
    const [isFollowing, setIsFollowing] = useState(userData?.followings?.includes(post.userid));

    useEffect(() => {
        async function fetchAuthors() {
            const authorIds = [...new Set(comments.map(c => c.user))];
            const { data } = await supabase.from('users').select('id, name, avatar').in('id', authorIds);
            const authorMap = {};
            data?.forEach(u => authorMap[u.id] = u);
            setCommentAuthors(authorMap);
        }
        if (showComments && comments.length > 0) fetchAuthors();
    }, [showComments, comments]);

    useEffect(() => {
        async function getAuthor() {
            const { data } = await supabase.from('users').select('*').eq('id', post.userid).single();
            setAuthor(data);
        }
        getAuthor();
    }, [post.userid]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(() => {});
                    } else {
                        videoRef.current?.pause();
                    }
                });
            },
            { threshold: 0.8 }
        );
        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const val = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(val);
        }
    };

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
        } catch (err) {}
    };

    const handleLike = async (e) => {
        if (e) e.stopPropagation();
        if (!userData || isLiked) return;
        try {
            await actionLike(post.id, userData.id);
            setIsLiked(true);
            setLikesCount(prev => prev + 1);
        } catch (err) {}
    };

    const handleDoubleTap = (e) => {
        e.stopPropagation();
        setShowHeart(true);
        handleLike();
        setTimeout(() => setShowHeart(false), 800);
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: post.header || "Athena Post",
                text: post.text,
                url: window.location.href
            });
        } catch (err) {}
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !userData) return;
        try {
            await actionComment(post.id, userData.id, commentText);
            setComments(prev => [...prev, { id: Date.now(), user: userData.id, text: commentText, post: post.id }]);
            setCommentText("");
        } catch (err) {}
    };

    const isVideo = post.media?.[0]?.match(/\.(mp4|webm|ogg|mov)$/i) || post.media?.[0]?.startsWith("data:video/");

    return (
        <div className="short-video-wrapper" onDoubleClick={handleDoubleTap}>
            {isVideo ? (
                <video
                    ref={videoRef}
                    src={post.media[0]}
                    loop
                    muted={isMuted}
                    playsInline
                    className="short-video"
                    onTimeUpdate={handleTimeUpdate}
                    onClick={() => {
                        if (videoRef.current.paused) videoRef.current.play();
                        else videoRef.current.pause();
                    }}
                />
            ) : (
                <div className="short-img-container">
                    <img src={post.media[currentImg]} className="short-video" alt="Short media" />
                    {post.media.length > 1 && (
                        <div className="short-img-nav">
                             <div className="img-counter">{currentImg + 1}/{post.media.length}</div>
                             <div className="img-dots">
                                 {post.media.map((_, i) => (
                                     <span 
                                        key={i} 
                                        className={i === currentImg ? 'active' : ''} 
                                        onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }}
                                     ></span>
                                 ))}
                             </div>
                        </div>
                    )}
                </div>
            )}

            {showHeart && <div className="heart-pop"><FaHeart /></div>}
            
            <button className="short-sound-btn" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
                {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
            </button>

            <div className="short-overlay">
                <div className="short-user">
                    {author?.avatar ? (
                        <img src={author.avatar} alt="avatar" className="short-avatar" />
                    ) : (
                        <div className="short-avatar default"><FaUser size={18} /></div>
                    )}
                    <span className="short-username">{author?.name || "User"}</span>
                    {userData && userData.id !== post.userid && (
                        <button 
                            className={`short-follow-btn ${isFollowing ? 'following' : ''}`} 
                            onClick={handleFollow}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
                <div className="short-description">
                    {post.header && <strong>{post.header} </strong>}
                    {post.text}
                </div>
                <div className="short-music">
                    <FaMusic size={12} />
                    <span>Original Audio • {author?.name}</span>
                </div>
            </div>

            <div className="short-actions">
                <div className="short-action-item" onClick={handleLike}>
                    <FaHeart color={isLiked ? "#ff3040" : "white"} />
                    <span>{likesCount}</span>
                </div>
                <div className="short-action-item" onClick={() => setShowComments(true)}>
                    <FaComment />
                    <span>{comments.length}</span>
                </div>
                <div className="short-action-item" onClick={handleShare}>
                    <FaShare />
                    <span>Share</span>
                </div>
                <div className="short-action-item">
                    <div className="short-music-disk">
                         {author?.avatar && <img src={author.avatar} />}
                    </div>
                </div>
            </div>

            {isVideo && <div className="video-progress-bar" style={{ width: `${progress}%` }}></div>}

            {showComments && (
                <div className="short-comments-overlay" onClick={() => setShowComments(false)}>
                    <div className="short-comments-content" onClick={e => e.stopPropagation()}>
                        <div className="short-comments-header">
                            <span>Comments</span>
                            <FaTimes onClick={() => setShowComments(false)} />
                        </div>
                        <div className="short-comments-list">
                            {comments.length > 0 ? comments.map(c => (
                                <div key={c.id} className="short-comment-item">
                                    <div className="comment-user-avatar">
                                        {commentAuthors[c.user]?.avatar ? <img src={commentAuthors[c.user].avatar} /> : <FaUser />}
                                    </div>
                                    <div className="comment-body">
                                        <span className="comment-user">{commentAuthors[c.user]?.name || `User ${c.user}`}</span>
                                        <p className="comment-text">{c.text}</p>
                                    </div>
                                </div>
                            )) : <div className="no-comments">No comments yet.</div>}
                        </div>
                        <form className="short-comment-form" onSubmit={handleAddComment}>
                            <input type="text" placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                            <button type="submit" disabled={!commentText.trim()}>Post</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Shorts() {
    const [shorts, setShorts] = useState([]);
    const { userData } = useOutletContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchShorts() {
            const { data, error } = await supabase.from('posts').select('*');
            if (!error) {
                const mediaPosts = data.filter(p => p.media && p.media.length > 0);
                setShorts(mediaPosts.sort(() => Math.random() - 0.5));
            }
            setLoading(false);
        }
        fetchShorts();
    }, []);

    if (loading) return <div className="shorts-loading">Loading...</div>;

    return (
        <div className="shorts-container">
            {shorts.length > 0 ? (
                shorts.map(short => (
                    <ShortItem key={short.id} post={short} userData={userData} />
                ))
            ) : (
                <div className="no-shorts">No posts found.</div>
            )}
        </div>
    );
}

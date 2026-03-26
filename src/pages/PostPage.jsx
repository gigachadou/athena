import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import "../styles/PostPage.css";
import { FaComment, FaEye, FaHeart, FaPaperPlane, FaPen, FaTrash, FaU } from "react-icons/fa6";
import { actionView } from "../utils/postActions/actionView";
import actionDislike from "../utils/postActions/actionDislike";
import actionLike from "../utils/postActions/actionLike";
import actionComment from "../utils/postActions/actionComment";
import { FaUser } from "react-icons/fa";
import actionDeleteComment from "../utils/postActions/actionDeleteComment";

export default function PostPage() {
    const { postId } = useParams();
    const [serverError, setServerError] = useState(null);
    const [data, setData] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const { userData } = useOutletContext();
    const [isViewed, setIsViewed] = useState(false);
    const [trigger, setTrigger] = useState(0);
    const [commentOwners, setCommentOwners] = useState({});
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function getPost() {
            try {
                const res = await fetch(`http://localhost:3000/posts/${postId}`);
                if (!res.ok) throw new Error("Couldn't get the post needed");
                const post = await res.json();

                const res2 = await fetch(`http://localhost:3000/users/${post.userId}`);
                if (!res2.ok) throw new Error("Couldn't get the information");
                const owner = await res2.json();

                if (post.likes.includes(userData.id)) setIsLiked(true);
                else setIsLiked(false);

                setData({ post: post, owner: owner });
            } catch (error) {
                setServerError(error.message);
            }
        };
        getPost();
    }, [postId, userData.id, trigger, isViewed, isLiked]);

    useEffect(() => {
        async function fetchUsers() {
            const uniqueUserIds = [...new Set((data?.post?.comments || []).map(c => c.user))];
            if (!uniqueUserIds.length) {
                setCommentOwners({});
                return;
            }

            const promises = uniqueUserIds.map(id =>
                fetch(`http://localhost:3000/users/${id}`)
                    .then(res => res.ok ? res.json() : Promise.reject())
                    .catch(() => ({ id, name: "User not found", _error: true }))
            );

            const results = await Promise.all(promises);
            const usersMap = results.reduce((acc, user) => {
                acc[user.id] = user;
                return acc;
            }, {});

            setCommentOwners(usersMap);
        }

        if (data?.post) {
            fetchUsers();
        }
    }, [data]);
    useEffect(() => {
        if (!data) return;

        if (!isViewed && data.post.userId !== userData.id) {
            actionView(postId).then(() => setIsViewed(true)).catch(err => console.log("View action failed:", err.message));
        };
    }, [data, postId, userData.id]);


    async function toggleLike() {
        try {
            if (isLiked) {
                await actionDislike(postId, userData.id);
                setIsLiked(false);
            } else {
                await actionLike(postId, userData.id);
                setIsLiked(true);
            }
        } catch (error) {
            alert("Something went wrong, please try again later");
        };
    };

    async function handleAddComment() {
        const text = inputRef.current.value;
        if (!text.trim()) return;
        try {
            await actionComment(postId, userData.id, text);
            inputRef.current.value = "";
            setTrigger(prev => prev + 1);
        } catch (error) {
            setServerError(error.message);
        }
    };

    async function handleCommentDelete(postId, commentId) {
        try {
            await actionDeleteComment(postId, commentId);
            setTrigger(prev => prev + 1);
        } catch (error) {
            console.error(error.message);
        };
    };

    return (
        <div>
            {serverError ? (
                <div className="post-serverError">{serverError}</div>
            ) : data ? (
                <div className="post-page">
                    <article className="post">
                        <div className="post-page-header" onClick={() => data.post.userId === userData.id ? navigate("/profile") : navigate(`/searchresultusers/${data.owner.id}`)}>
                            <div className="post-page-user-info">
                                <div className="post-page-avatar">
                                    {!data.owner?.avatar ? <FaUser /> : <img src={data.owner.avatar} alt='user avatar' />}
                                </div>
                                <div className="meta">
                                    <span className="post-page-username">{!data.owner?.name ? "User" : data.owner.name}</span>
                                </div>
                            </div>
                            <button className="post-page-more-btn">⋯</button>
                        </div>
                        <h1 className="post-page-title">{data.post.header}</h1>

                        <div className="post-meta">
                            <span>{new Date(data.post.createdAt).toLocaleString()}</span>
                        </div>

                        <p className="post-text">{data.post.text}</p>
                        {data.post.media?.length > 0 &&
                            data.post.media.map((e, i) => (
                                <img src={e} alt="Post media" key={i} />
                            ))}

                        <div className="post-stats">
                            <div
                                className="action like"
                                onClick={toggleLike}
                                style={
                                    isLiked
                                        ? { color: "#e41e3f" }
                                        : {}
                                }
                            >
                                <span className="icon">
                                    <FaHeart /> Likes: {data.post.likes?.length}
                                </span>
                            </div>
                            <div className="action comment">
                                <span className="icon">
                                    <FaComment /> Comments: {data.post.comments?.length}
                                </span>
                            </div>
                            <div className="action view">
                                <span className="icon">
                                    <FaEye /> Views: {data.post.views}
                                </span>
                            </div>
                        </div>
                    </article>

                    <section className="comments">
                        <h2>Comments</h2>
                        <div className="post-page-add-comment-container">
                            <input ref={inputRef} type="text" placeholder="Share your thoughts" />
                            <button onClick={handleAddComment}><FaPaperPlane /></button>
                        </div>
                        {data.post.comments?.length ? [...data.post.comments].reverse().map((comment, index) => {
                            const owner = commentOwners[comment.user] || { name: "Loading...", id: null };
                            return (
                                <div key={comment.id || index} className="post-page-comment">
                                    <div
                                        className="post-page-comment-owner"
                                        onClick={() => {
                                            if (owner.id) owner.id !== userData.id ? navigate(`/searchresultusers/${owner.id}`) : navigate(`/profile`)
                                        }}
                                        style={{ cursor: owner.id ? "pointer" : "default", color: "lightblue" }}
                                    > {/* style qo'shish kerak */}
                                        {!owner?.avatar ? <FaUser width={60} height={60} /> : <img src={owner.avatar} alt="Avatar" width={60} style={{ border: "1px transparent", borderRadius: "50%" }} />} {/* style qo'shish kerak */}
                                        <p>{owner.name}</p>
                                    </div>
                                    {comment.text}
                                    {(owner.id === userData.id || data.post.userId === userData.id) &&
                                        <div>
                                            <FaPen />
                                            <FaTrash onClick={() => handleCommentDelete(data.post.id, comment.id)} />
                                        </div>}
                                </div>
                            );
                        }) : <div></div>}
                    </section>
                </div>
            ) : null}
        </div>
    );
}

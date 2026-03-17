import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import "../styles/PostPage.css";
import { FaComment, FaEye, FaHeart } from "react-icons/fa6";
import { actionView } from "../utils/postActions/actionView";
import actionDislike from "../utils/postActions/actionDislike";
import actionLike from "../utils/postActions/actionLike";

export default function PostPage() {
    const { postId } = useParams();
    const [serverError, setServerError] = useState(null);
    const [data, setData] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const { userData } = useOutletContext();
    const [isViewed, setIsViewed] = useState(false);

    useEffect(() => {
        async function getPost() {
            try {
                const res = await fetch(`http://localhost:3000/posts/${postId}`);
                if (!res.ok) throw new Error("Could not get the post needed");
                const post = await res.json();
                const res2 = await fetch(`http://localhost:3000/users/${post.userId}`);
                if (!res2.ok) throw new Error("Could not get the information");
                const owner = await res2.json();
                if (post.likes.includes(userData.id)) setIsLiked(true);
                else setIsLiked(false);

                setData({ post: post, owner: owner });
                console.log(post);
            } catch (error) {
                setServerError(error.message);
            }
        }
        getPost();
    }, [postId, userData.id, isLiked]);

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
            console.error(error);
        };
    };

    return (
        <div>
            {serverError ? (
                <div className="post-serverError">{serverError}</div>
            ) : data ? (
                <div className="post-page">
                    <article className="post">
                        <div className="post-page-header">
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
                        <h1 className="post-page-header">{data.post.header}</h1>

                        <div className="post-meta">
                            <span>{new Date(data.post.createdAt).toLocaleString()}</span>
                        </div>

                        <p className="post-text">{data.text}</p>
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
                                    <FaHeart /> Likes: {data.post.likes.length}
                                </span>
                            </div>
                            <div className="action comment">
                                <span className="icon">
                                    <FaComment /> Comments: {data.post.comments.length}
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

                        {data.post.comments.length === 0 ? (
                            <p>No comments yet</p>
                        ) : (
                            data.post.comments.map((comment, index) => (
                                <div key={index} className="post-page-comment">
                                    {comment.text}
                                </div>
                            ))
                        )}
                    </section>
                </div>
            ) : null}
        </div>
    );
}
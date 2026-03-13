import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PostPage() {
    const { postId } = useParams();
    const [serverError, setServerError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        async function getUserInfo() {
            const res = await fetch(`http://localhost:3000/posts/${postId}`);
            if (!res.ok) setServerError("Post not found");
            const data = await res.json();
            setData(data);
            console.log(data);
        };
        getUserInfo();
    }, [postId]);

    return (
        <div>
            {!serverError ? data && <div className="post-page">
                <article className="post">

                    <h1 className="post-header">{data.header}</h1>

                    <div className="post-meta">
                        <span>User ID: {data.userId}</span>
                        <span> • </span>
                        <span>{new Date(data.createdAt).toLocaleString()}</span>
                    </div>

                    <p className="post-text">{data.text}</p>

                    <div className="post-stats">
                        <span>👍 Likes: {data.likes.length}</span>
                        <span> 💬 Comments: {data.comments.length}</span>
                        <span> 👁 Views: {data.views}</span>
                    </div>

                </article>

                <section className="comments">
                    <h2>Comments</h2>

                    {data.comments.length === 0 ? (
                        <p>No comments yet</p>
                    ) : (
                        data.comments.map((comment, index) => (
                            <div key={index} className="comment">
                                {comment.text}
                            </div>
                        ))
                    )}

                </section>
            </div> :
                <div className="post-serverError">{serverError}</div>
            }
        </div>
    )
};
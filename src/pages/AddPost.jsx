import { useState } from "react";
import "../styles/AddPost.css";
import { useOutletContext } from "react-router-dom";

export default function AddPost() {
    const [header, setHeader] = useState("");
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const { userData } = useOutletContext();
    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError("");
            // posting to /posts
            const postId = `${userData.email}-${Date.now()}`;

            const postResponse = await fetch("http://localhost:3000/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    header: header.trim(),
                    text: text.trim(),
                    id: postId,
                    userId: userData.id,
                    createdAt: new Date().toISOString()
                })
            });

            if (!postResponse.ok) {
                const errText = await postResponse.text();
                setError(`Error at loading your post to the server: ${postResponse.status} - ${errText}`);
                return;
            }

            // adding postId to user/posts

            // 1. Get current user data
            const userRes = await fetch(`http://localhost:3000/users/${userData.id}`);

            if (!userRes.ok) {
                setError("Couldn't get user's data");
                return;
            }

            const user = await userRes.json();

            // 2. Append the new post ID to the array
            const updatedPosts = [...user.posts, postId];

            const patchRes = await fetch(`http://localhost:3000/users/${userData.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ posts: updatedPosts })
            });

            if (!patchRes.ok) {
                setError("Error at adding post's id to user");
                console.log(await patchRes.text());
                return;
            }

            console.log("Posted successfully!");
            setHeader("");
            setText("");
        } catch (err) {
            setError(`General error: ${err.message}`);
            console.error(err);
        };
    };

    return (
        <div className="add-post-page">
            <div className="add-post-card">
                <h2 className="add-post-title">Create Post</h2>
                {error && <p>{error}</p>}
                <p className="add-post-subtitle">Share an update with your community.</p>
                <form onSubmit={e => handleSubmit(e)} className="add-post-form">
                    <div className="add-post-field">
                        {error && <div className="add-post-error">{error}</div>}
                        <label className="add-post-label">Header</label>
                        <input
                            className="add-post-input"
                            name="header"
                            value={header}
                            onChange={(e) => setHeader(e.target.value)}
                            placeholder="What's new?"
                            type="text"
                            maxLength={50}
                            required
                        />
                        <div className="add-post-meta">{header.length}/50</div>
                    </div>
                    <div className="add-post-field">
                        <label className="add-post-label">Text</label>
                        <textarea
                            className="add-post-textarea"
                            name="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Tell people what is happening..."
                            rows={6}
                            maxLength={300}
                        />
                        <div className="add-post-meta">{text.length}/300</div>
                    </div>
                    <button type="submit" className="add-post-submit">Post</button>
                </form>
            </div>
        </div>
    );
};

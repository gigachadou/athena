import { useState } from "react";
import "../styles/AddPost.css";
import { useOutletContext } from "react-router-dom";
import { convertToBase64 } from "../utils/convertToBase64";

export default function AddPost() {
    const [header, setHeader] = useState("");
    const [text, setText] = useState("");
    const [media, setMedia] = useState(null);
    const [error, setError] = useState("");
    const { userData } = useOutletContext();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError("");
            // posting to /posts
            const postId = `${userData.email}-${Date.now()}`;

            if (media) {
                var base64media = await convertToBase64(media);
                if (!base64media) {
                    setError("Could not convert image to a form needed, choose different media or try again");
                    throw new Error("Error at converting to Base 64");
                };
            };

            const postResponse = await fetch("http://localhost:3000/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    header: header.trim(),
                    text: text.trim(),
                    likes: [],
                    comments: [],
                    views: 0,
                    id: postId,
                    userId: userData.id,
                    media: base64media ? base64media : null,
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
            const updatedPosts = [...(user.posts || []), postId];

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
            setHeader("");
            setText("");
            setMedia(null);
        } catch (err) {
            setError(`General error: ${err.message}`);
            console.error(err);
        };
    };

    return (
        <div className="add-post-page">
            <div className="add-post-card">
                <h2 className="add-post-title">Create a post</h2>
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
                    <div>
                        <label className="add-post-label">Media: </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setMedia(e.target.files[0])}
                        />
                        {media && <p style={{ color: "black", marginTop: "15px", marginBottom: "0px" }}>File chosen</p>}
                    </div>
                    <button type="submit" className="add-post-submit">Post</button>
                </form>
            </div>
        </div>
    );
};

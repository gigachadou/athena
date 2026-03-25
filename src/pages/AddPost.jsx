import { useEffect, useState } from "react";
import "../styles/AddPost.css";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { convertToBase64 } from "../utils/convertToBase64";
import addNote from "../utils/addNotification";

export default function AddPost() {
    const { postId: routePostId } = useParams();
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(null);
    const [header, setHeader] = useState("");
    const [text, setText] = useState("");
    const [media, setMedia] = useState([]);
    const [mediaId, setMediaId] = useState(null);
    const { userData } = useOutletContext();
    const navigate = useNavigate();
    useEffect(() => {
        async function loadPostForEdit() {
            try {
                setError("");
                const res = await fetch(`http://localhost:3000/posts/${routePostId}`);
                if (!res.ok) {
                    throw new Error("Couldn't load post");
                }
                const data = await res.json();
                if (data.userId !== userData.id) navigate("/");
                setHeader(data.header || "");
                setText(data.text || "");
                setMediaId(data.media);
                const loadedMedia = (data.media || []).map(base64 => ({
                    base64,
                    id: Date.now() + Math.random()
                }));
                setMedia(loadedMedia);
            } catch (err) {
                setError(err.message);
            }
        }

        if (routePostId) {
            loadPostForEdit();
        } else {
            setHeader("");
            setText("");
            setMedia([]);
            setError("");
        }
    }, [routePostId]);

    async function handleAddMedia(e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        if (media.length >= 10) {
            setError("You can not add anymore");
            return;
        };

        const availableSlots = 10 - media.length;
        const selectedFiles = files.slice(0, availableSlots);

        try {
            const converted = await Promise.all(
                selectedFiles.map(async (file) => {
                    const base64 = await convertToBase64(file);
                    return {
                        base64,
                        id: Date.now() + Math.random()
                    };
                })
            );
            setMedia(prev => [...prev, ...converted]);
            setError("");
        } catch {
            setError("Could not convert image to a form needed, choose different image or try again");
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError("");
            const isEditMode = Boolean(routePostId);
            const newPostId = `${userData.email}-${Date.now()}`;

            const mediaSet = media.map(e => e.base64);

            let postResponse;
            let mediaResponse;
            if (!isEditMode) {
                let mediaResData = null;
                if (mediaSet?.length) {
                    mediaResponse = await fetch("http://localhost:3000/media", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            media: mediaSet
                        })
                    });
                    if (!mediaResponse.ok) throw new Error("Couldn't load the media given to the server");
                    mediaResData = await mediaResponse.json();
                };

                postResponse = await fetch("http://localhost:3000/posts", {
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
                        id: newPostId,
                        userId: userData.id,
                        media: mediaResData ? mediaResData.id : null,
                        createdAt: new Date().toISOString(),
                        lastEdited: new Date().toISOString()
                    })
                });
            } else {
                //EDITING ------------------------------------------------------------------------
                if (mediaId) {
                    mediaResponse = await fetch(`http://localhost:3000/media/${mediaId}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            media: mediaSet
                        })
                    });
                };

                postResponse = await fetch(`http://localhost:3000/posts/${routePostId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        header: header.trim(),
                        text: text.trim(),
                        lastEdited: new Date().toISOString()
                    })
                });
            }

            if (!postResponse.ok) {
                const errText = await postResponse.text();
                throw new Error(`Error at loading your post to the server: ${postResponse.status} - ${errText}`);
            };

            // adding postId to user/posts

            // 1. Get current user data
            if (!isEditMode) {
                const userRes = await fetch(`http://localhost:3000/users/${userData.id}`);

                if (!userRes.ok) throw new Error("Couldn't get user's data");

                const user = await userRes.json();

                // 2. Append the new post ID to the array
                const updatedPosts = [...(user.posts || []), newPostId];

                const patchRes = await fetch(`http://localhost:3000/users/${userData.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ posts: updatedPosts })
                });

                if (!patchRes.ok) {
                    throw new Error("Error at adding post's id to user");
                };
            };

            setHeader("");
            setText("");
            setMedia([]);
            addNote(
                isEditMode ? "Post updated successfully." : "Post added successfully.",
                "Thank you again for staying with us.",
                userData.id
            );
            setNotification({
                title: isEditMode ? "Post updated successfully" : "Post added successfully",
                text: "Thank you for staying with us"
            });

            // 5 sekunddan keyin yo‘qoladi
            setTimeout(() => {
                setNotification(null);
            }, 5000);
        } catch (err) {
            setError(`General error: ${err.message}`);
        };
    };

    return (
        <div className="add-post-page">
            {notification && (
                <div className="toast">
                    <div className="toast-title">{notification.title}</div>
                    <div className="toast-text">{notification.text}</div>
                </div>
            )}
            <div className="add-post-card">
                <h2 className="add-post-title">Create a post</h2>
                {error && <p>{error}</p>}
                <h3 className="add-post-subtitle">Share an update with your community.</h3>
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
                        <label className="add-post-label">Media: (limit 10 images)</label>
                        <label className="add-post-add-media-label">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleAddMedia}
                                className="add-post-add-media"
                            />
                            <span className="plus-icon">+</span>
                            <span className="upload-text">Add media (images/videos)</span>
                        </label>
                        {media.map((obj) => (
                            <div className="add-post-media-preview" key={obj.id}>
                                {obj.base64.startsWith("data:video/") ? (
                                    <video
                                        src={obj.base64}
                                        controls
                                        className="add-post-media-img"
                                    />
                                ) : (
                                    <img
                                        src={obj.base64}
                                        alt="Uploaded preview"
                                        className="add-post-media-img"
                                    />
                                )}
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => setMedia(prev => prev.filter((e) => e.id !== obj.id))}
                                    aria-label="Remove media"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="add-post-submit">Post</button>
                </form>
            </div>
        </div>
    );
};

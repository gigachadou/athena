import { useEffect, useState } from "react";
import "../styles/AddPost.css";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { convertToBase64 } from "../utils/convertToBase64";
import addNote from "../utils/addNotification";
import { supabase } from "../utils/supabaseClient";
import { FaArrowLeft } from "react-icons/fa";

export default function AddPost() {
    const { postId: routePostId } = useParams();
    const [error, setError] = useState("");
    const [header, setHeader] = useState("");
    const [text, setText] = useState("");
    const [media, setMedia] = useState([]);
    const [notification, setNotification] = useState(null);
    const { userData, setTriggerWindow } = useOutletContext();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadPostForEdit() {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', routePostId)
                    .single();

                if (!error) {
                    if (data.userid !== userData.id) {
                        navigate("/");
                    }
                    setHeader(data.header || "");
                    setText(data.text || "");

                    let loaded = [];
                    for (let m of (data.media || [])) {
                        loaded.push({ base64: m, id: Math.random() });
                    }
                    setMedia(loaded);
                }
            } catch (err) {

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

        const hasVideo = media.some(m => m.file?.type.startsWith('video/'));

        try {
            const processedMedia = [];
            for (const file of selectedFiles) {
                const isVideo = file.type.startsWith('video/');

                if (isVideo && (hasVideo || processedMedia.some(m => m.file?.type.startsWith('video/')))) {
                    setError("Faqat bitta video yuklash mumkin");
                    continue;
                }

                if (isVideo && (media.length > 0 || processedMedia.length > 0)) {
                    setError("Video va rasmni birga yuklab bo'lmaydi");
                    continue;
                }

                if (!isVideo && hasVideo) {
                    setError("Video bor joyga rasm qo'shib bo'lmaydi");
                    continue;
                }

                let duration = null;
                if (isVideo) {
                    const video = document.createElement('video');
                    video.preload = 'metadata';
                    duration = await new Promise((resolve) => {
                        video.onloadedmetadata = () => {
                            window.URL.revokeObjectURL(video.src);
                            resolve(video.duration);
                        };
                        video.src = URL.createObjectURL(file);
                    });

                    if (duration > 90) {
                        setError(`Video juda uzun (${Math.floor(duration)}s). Maksimal 1:30 daqiqa.`);
                        continue;
                    }
                }

                const base64 = await convertToBase64(file);
                processedMedia.push({
                    base64,
                    file,
                    duration,
                    id: Date.now() + Math.random()
                });
            }

            setMedia(prev => [...prev, ...processedMedia]);
            if (processedMedia.length > 0) setError("");
        } catch {
            setError("Error processing files.");
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError("");
            const isEditMode = Boolean(routePostId);
            const newPostId = `${userData.email}-${Date.now()}`;

            const mediaUrls = [];
            for (const item of media) {
                if (item.file) {
                    // Sanitize file name: remove non-alphanumeric characters (except dots)
                    const sanitizedName = item.file.name.replace(/[^a-zA-Z0-9.]/g, '-').replace(/-+/g, '-');
                    const fileName = `${userData.id}-${Date.now()}-${sanitizedName}`;
                    
                    const { error: uploadError } = await supabase.storage
                        .from('media')
                        .upload(`posts/${fileName}`, item.file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('media')
                        .getPublicUrl(`posts/${fileName}`);
                    mediaUrls.push(publicUrl);
                } else {
                    mediaUrls.push(item.base64);
                }
            }

            if (!isEditMode) {
                const { error: postError } = await supabase
                    .from('posts')
                    .insert([{
                        id: newPostId,
                        header: header.trim(),
                        text: text.trim(),
                        likes: [],
                        comments: [],
                        views: 0,
                        userid: userData.id,
                        media: mediaUrls,
                        createdat: new Date().toISOString(),
                        lastedited: new Date().toISOString()
                    }]);

                if (postError) throw postError;

                const { data: user, error: userFetchError } = await supabase
                    .from('users')
                    .select('posts')
                    .eq('id', userData.id)
                    .single();

                if (userFetchError) throw userFetchError;

                const updatedPosts = [...(user.posts || []), newPostId];

                const { error: userUpdateError } = await supabase
                    .from('users')
                    .update({ posts: updatedPosts })
                    .eq('id', userData.id);

                if (userUpdateError) throw userUpdateError;

            } else {
                const { error: postUpdateError } = await supabase
                    .from('posts')
                    .update({
                        header: header.trim(),
                        text: text.trim(),
                        media: mediaUrls,
                        lastedited: new Date().toISOString()
                    })
                    .eq('id', routePostId);

                if (postUpdateError) throw postUpdateError;
            }

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

            setTriggerWindow(prev => ++prev);

            setTimeout(() => {
                setNotification(null);
            }, 5000);

            navigate("/profile");
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
                <button onClick={() => navigate(-1)} className="back"><FaArrowLeft /></button>
                <h2 className="add-post-title">Create a post</h2>

                {error && <p>{error}</p>}
                <h3 className="add-post-subtitle">Share an update with your community.</h3>
                <form onSubmit={e => handleSubmit(e)} className="add-post-form">
                    <div className="add-post-field">
                        {error && <div className="add-post-error">{error}</div>}
                        <label className="add-post-label">Header</label>
                        <input
                            className="input-alt add-post-input"
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
                                {obj.base64.startsWith("data:video/") || obj.file?.type.startsWith("video/") ? (
                                    <div style={{ position: "relative" }}>
                                        <video
                                            src={obj.base64}
                                            className="add-post-media-img"
                                        />
                                        <div className="video-badge" style={{ position: "absolute", top: "5px", left: "5px", background: "rgba(0,0,0,0.6)", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>VIDEO</div>
                                        {obj.duration && <div className="video-duration" style={{ position: "absolute", bottom: "5px", right: "5px", background: "rgba(0,0,0,0.6)", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>{Math.floor(obj.duration)}s</div>}
                                    </div>
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
                    <button type="button" onClick={() => navigate(-1)} className="add-post-submit" style={{ marginTop: "10px", backgroundColor: "#333" }}>Cancel</button>
                </form>
            </div>
        </div>
    );
}

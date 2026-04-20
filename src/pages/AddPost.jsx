import { useEffect, useState } from "react";
import "../styles/AddPost.css";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { convertToBase64 } from "../utils/convertToBase64";
import addNote from "../utils/addNotification";
import { supabase } from "../utils/supabaseClient";
import { FaArrowLeft, FaVideo, FaImage, FaTags, FaInfoCircle } from "react-icons/fa";

export default function AddPost() {
    const { postId: routePostId } = useParams();
    const [error, setError] = useState("");
    const [header, setHeader] = useState("");
    const [text, setText] = useState("");
    const [media, setMedia] = useState([]);
    const [postType, setPostType] = useState("image"); // 'image' or 'video'
    const [tags, setTags] = useState("");
    const [forWho, setForWho] = useState("everyone");
    const [coverImage, setCoverImage] = useState(null);
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
                    setPostType(data.type || "image");
                    setTags(data.tags?.join(", ") || "");
                    setForWho(data.for_who || "everyone");
                    setCoverImage(data.cover_image ? { base64: data.cover_image, id: 'cover' } : null);

                    let loaded = [];
                    for (let m of (data.media || [])) {
                        loaded.push({ base64: m, id: Math.random() });
                    }
                    setMedia(loaded);
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (routePostId) {
            loadPostForEdit();
        } else {
            setHeader("");
            setText("");
            setMedia([]);
            setPostType("image");
            setTags("");
            setForWho("everyone");
            setCoverImage(null);
            setError("");
        }
    }, [routePostId, userData.id, navigate]);

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
            const processedMedia = [];
            for (const file of selectedFiles) {
                const isVideo = file.type.startsWith('video/');

                if (postType === 'video' && !isVideo) {
                    setError("Video postda faqat video yuklash mumkin");
                    continue;
                }
                if (postType === 'image' && isVideo) {
                    setError("Rasm postda video yuklab bo'lmaydi");
                    continue;
                }

                if (isVideo && (media.length > 0 || processedMedia.length > 0)) {
                    setError("Faqat bitta video yuklash mumkin");
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

                    if (duration > 180) { // Increased to 3 mins for "advanced"
                        setError(`Video juda uzun (${Math.floor(duration)}s). Maksimal 3 daqiqa.`);
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

    async function handleCoverUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const base64 = await convertToBase64(file);
        setCoverImage({ base64, file, id: 'cover' });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError("");
            if (media.length === 0) {
                setError("Iltimos, rasm yoki video yuklang");
                return;
            }

            const isEditMode = Boolean(routePostId);
            const newPostId = isEditMode ? routePostId : `${userData.email}-${Date.now()}`;

            const mediaUrls = [];
            for (const item of media) {
                if (item.file) {
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

            let coverUrl = null;
            if (coverImage) {
                if (coverImage.file) {
                    const fileName = `${userData.id}-${Date.now()}-cover-${coverImage.file.name}`;
                    const { error: coverError } = await supabase.storage
                        .from('media')
                        .upload(`covers/${fileName}`, coverImage.file);
                    if (coverError) throw coverError;
                    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`covers/${fileName}`);
                    coverUrl = publicUrl;
                } else {
                    coverUrl = coverImage.base64;
                }
            }

            const postData = {
                id: newPostId,
                header: header.trim(),
                text: text.trim(),
                type: postType,
                tags: tags.split(",").map(t => t.trim()).filter(t => t),
                for_who: forWho,
                cover_image: coverUrl,
                userid: userData.id,
                media: mediaUrls,
                lastedited: new Date().toISOString()
            };

            if (!isEditMode) {
                const { error: postError } = await supabase
                    .from('posts')
                    .insert([{
                        ...postData,
                        likes: [],
                        comments: [],
                        views: 0,
                        createdat: new Date().toISOString()
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
                    .update(postData)
                    .eq('id', routePostId);

                if (postUpdateError) throw postUpdateError;
            }

            setHeader("");
            setText("");
            setMedia([]);
            setTags("");
            setCoverImage(null);
            
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
                <h2 className="add-post-title">{routePostId ? "Edit Post" : "Create a post"}</h2>

                <div className="post-type-selector">
                    <button 
                        className={`type-btn ${postType === 'image' ? 'active' : ''}`}
                        onClick={() => { setPostType('image'); setMedia([]); }}
                    >
                        <FaImage /> Image
                    </button>
                    <button 
                        className={`type-btn ${postType === 'video' ? 'active' : ''}`}
                        onClick={() => { setPostType('video'); setMedia([]); }}
                    >
                        <FaVideo /> Video
                    </button>
                </div>

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
                            rows={4}
                            maxLength={300}
                        />
                        <div className="add-post-meta">{text.length}/300</div>
                    </div>

                    <div className="add-post-field">
                        <label className="add-post-label"><FaTags /> Tags (comma separated)</label>
                        <input
                            className="add-post-input"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. nature, tech, fun"
                            type="text"
                        />
                    </div>

                    <div className="add-post-field">
                        <label className="add-post-label"><FaInfoCircle /> For who?</label>
                        <select 
                            className="add-post-input" 
                            value={forWho} 
                            onChange={(e) => setForWho(e.target.value)}
                        >
                            <option value="everyone">Everyone</option>
                            <option value="followers">Followers Only</option>
                            <option value="close-friends">Close Friends</option>
                        </select>
                    </div>

                    <div className="media-upload-section">
                        <label className="add-post-label">
                            {postType === 'video' ? "Video (Max 3 mins)" : "Images (Max 10 images)"}
                        </label>
                        <label className="add-post-add-media-label">
                            <input
                                type="file"
                                accept={postType === 'video' ? "video/*" : "image/*"}
                                multiple={postType === 'image'}
                                onChange={handleAddMedia}
                                className="add-post-add-media"
                            />
                            <span className="plus-icon">+</span>
                            <span className="upload-text">Upload {postType}</span>
                        </label>

                        <div className="media-previews">
                            {media.map((obj) => (
                                <div className="add-post-media-preview" key={obj.id}>
                                    {obj.base64.startsWith("data:video/") || obj.file?.type.startsWith("video/") || (typeof obj.base64 === 'string' && obj.base64.includes('.mp4')) ? (
                                        <div style={{ position: "relative" }}>
                                            <video src={obj.base64} className="add-post-media-img" />
                                            <div className="video-badge">VIDEO</div>
                                            {obj.duration && <div className="video-duration">{Math.floor(obj.duration)}s</div>}
                                        </div>
                                    ) : (
                                        <img src={obj.base64} alt="Preview" className="add-post-media-img" />
                                    )}
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => setMedia(prev => prev.filter((e) => e.id !== obj.id))}
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="add-post-field">
                        <label className="add-post-label">Cover Image (Thumbnail)</label>
                        <label className="add-post-add-media-label cover-upload">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverUpload}
                                className="add-post-add-media"
                            />
                            {coverImage ? (
                                <img src={coverImage.base64} alt="Cover" className="cover-preview-img" />
                            ) : (
                                <span className="upload-text">Select Thumbnail</span>
                            )}
                        </label>
                        {coverImage && (
                            <button 
                                type="button" 
                                className="remove-cover" 
                                onClick={() => setCoverImage(null)}
                            >Remove Cover</button>
                        )}
                    </div>

                    <button type="submit" className="add-post-submit">
                        {routePostId ? "Save Changes" : "Post"}
                    </button>
                </form>
            </div>
        </div>
    );
}


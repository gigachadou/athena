import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { convertToBase64 } from "../utils/convertToBase64";
import addNote from "../utils/addNotification";
import { FaImage, FaVideo, FaTags, FaInfoCircle, FaTimes, FaGlobe, FaUserFriends, FaLock } from "react-icons/fa";
import "../styles/CreatePostInline.css";

export default function CreatePostInline({ userData, onPostCreated }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [header, setHeader] = useState("");
    const [text, setText] = useState("");
    const [media, setMedia] = useState([]);
    const [postType, setPostType] = useState("image");
    const [tags, setTags] = useState("");
    const [forWho, setForWho] = useState("everyone");
    const [coverImage, setCoverImage] = useState(null);
    const [error, setError] = useState("");

    const handleAddMedia = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        
        setLoading(true);
        try {
            const processedMedia = [];
            for (const file of files) {
                const isVideo = file.type.startsWith('video/');
                if (postType === 'video' && !isVideo) continue;
                if (postType === 'image' && isVideo) continue;
                if (isVideo && processedMedia.length > 0) continue;

                const base64 = await convertToBase64(file);
                processedMedia.push({ base64, file, id: Math.random() });
            }
            setMedia(prev => [...prev, ...processedMedia].slice(0, 10));
            setError("");
        } catch (err) {
            setError("Media upload failed");
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!header.trim() || media.length === 0) {
            setError("Header and at least one media are required.");
            return;
        }

        setLoading(true);
        try {
            const newPostId = `${userData.email}-${Date.now()}`;
            const mediaUrls = [];
            
            for (const item of media) {
                const fileName = `${userData.id}-${Date.now()}-${item.file.name}`;
                const { error: uploadError } = await supabase.storage.from('media').upload(`posts/${fileName}`, item.file);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`posts/${fileName}`);
                mediaUrls.push(publicUrl);
            }

            let coverUrl = null;
            if (coverImage) {
                const fileName = `${userData.id}-${Date.now()}-cover-${coverImage.file.name}`;
                await supabase.storage.from('media').upload(`covers/${fileName}`, coverImage.file);
                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`covers/${fileName}`);
                coverUrl = publicUrl;
            }

            const { error: postError } = await supabase.from('posts').insert([{
                id: newPostId,
                header: header.trim(),
                text: text.trim(),
                type: postType,
                tags: tags.split(",").map(t => t.trim()).filter(t => t),
                for_who: forWho,
                cover_image: coverUrl,
                userid: userData.id,
                media: mediaUrls,
                likes: [],
                comments: [],
                views: 0,
                createdat: new Date().toISOString()
            }]);

            if (postError) throw postError;

            // Reward user with 5 A-Coins for posting!
            const { error: coinError } = await supabase.from('users').update({
                coins: (userData.coins || 0) + 5
            }).eq('id', userData.id);

            addNote("Post Created!", "You earned 5 A-Coins! 🪙", userData.id);
            
            // Reset form
            setHeader(""); setText(""); setMedia([]); setTags(""); setCoverImage(null); setIsExpanded(false);
            if (onPostCreated) onPostCreated();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className={`create-post-inline ${isExpanded ? 'expanded' : ''}`}>
            {!isExpanded ? (
                <div className="collapsed-view" onClick={() => setIsExpanded(true)}>
                    <img src={userData.avatar || "https://via.placeholder.com/40"} alt="me" className="mini-avatar" />
                    <div className="placeholder-bar">What's on your mind, {userData.name.split(' ')[0]}?</div>
                    <div className="quick-actions">
                        <FaImage className="action-icon img" />
                        <FaVideo className="action-icon vid" />
                    </div>
                </div>
            ) : (
                <form className="expanded-view" onSubmit={handleSubmit}>
                    <div className="header-row">
                        <h3>Create Post</h3>
                        <FaTimes className="close-btn" onClick={() => setIsExpanded(false)} />
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="Post Header (Required)" 
                        value={header} 
                        onChange={e => setHeader(e.target.value)}
                        className="post-input-header"
                        required
                    />
                    
                    <textarea 
                        placeholder="What's happening?" 
                        value={text} 
                        onChange={e => setText(e.target.value)}
                        rows={3}
                    />

                    <div className="post-options">
                        <div className="type-toggle">
                            <button type="button" className={postType === 'image' ? 'active' : ''} onClick={() => setPostType('image')}><FaImage /> Image</button>
                            <button type="button" className={postType === 'video' ? 'active' : ''} onClick={() => setPostType('video')}><FaVideo /> Video</button>
                        </div>
                        
                        <div className="privacy-selector">
                            <select value={forWho} onChange={e => setForWho(e.target.value)}>
                                <option value="everyone">🌐 Everyone</option>
                                <option value="followers">👥 Followers</option>
                                <option value="private">🔒 Only Me</option>
                            </select>
                        </div>
                    </div>

                    <div className="media-preview-row">
                        <label className="add-media-btn">
                            <input type="file" multiple={postType === 'image'} accept={postType === 'image' ? "image/*" : "video/*"} onChange={handleAddMedia} hidden />
                            <div className="plus-box">+</div>
                        </label>
                        {media.map(m => (
                            <div key={m.id} className="preview-item">
                                {postType === 'image' ? <img src={m.base64} alt="p" /> : <video src={m.base64} />}
                                <FaTimes className="remove-m" onClick={() => setMedia(media.filter(x => x.id !== m.id))} />
                            </div>
                        ))}
                    </div>

                    <div className="tag-input-row">
                        <FaTags />
                        <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <button type="submit" className="submit-post-btn" disabled={loading}>
                        {loading ? 'Posting...' : 'Post with A-Coins 🪙'}
                    </button>
                </form>
            )}
        </div>
    );
}

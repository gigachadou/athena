import { useState } from "react";
import "../styles/AddPost.css";
import { useOutletContext } from "react-router-dom";

export default function AddPost() {
    const [header, setHeader] = useState("");
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const {userData} = useOutletContext();
    function handleSubmit() {

    };
    return (
        <div className="add-post-page">
            <div className="add-post-card">
                <h2 className="add-post-title">Create Post</h2>
                <p className="add-post-subtitle">Share an update with your community.</p>
                <form onSubmit={handleSubmit} className="add-post-form">
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
                            required
                        />
                        <div className="add-post-meta">{text.length}/300</div>
                    </div>
                    <button type="submit" className="add-post-submit">Post</button>
                </form>
            </div>
        </div>
    );
};

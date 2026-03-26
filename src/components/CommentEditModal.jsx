import { useState } from "react"
import actionEditComment from "../utils/postActions/actionEditComment";

export default function CommentEditModal({ object, modalData, onSuccess }) {
    const { postId, commentId, previousText } = object;
    const [text, setText] = useState(previousText);
    const [error, setError] = useState("");

    async function handleSubmit() {
        if (!text.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        try {
            await actionEditComment(postId, commentId, text.trim());
            onSuccess?.();
            setText("")
            modalData(null);
        } catch (error) {
            setError(error.message);
        };
    };

    function handleIgnore() {
        setText("");
        modalData(null);
    };

    return (
        <dialog open className="dialog">
            <h2>Edit the Comment</h2>
            <h3 style={{ color: "red" }}>{error}</h3>
            <input
                type="text"
                placeholder=""
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <div className="modal__btns">
                <button onClick={handleSubmit}>Change</button>
                <button onClick={handleIgnore}>Cancel</button>
            </div>
        </dialog>
    )
};

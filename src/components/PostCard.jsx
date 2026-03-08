import { FaComment, FaEye, FaHeart, FaRegComment } from 'react-icons/fa';
import '../styles/PostCard.css';

const PostCard = ({ post }) => {
    const {
        header,
        text,
        likes,
        comments,
        views,
        id,
        userId,
        createdAt,
    } = post;

    // Format date nicely
    const timeAgo = createdAt
        ? new Date(createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        : 'just now';

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="user-info">
                    <div className="avatar">
                        {/* You can replace with real avatar later */}
                    </div>
                    <div className="meta">
                        <span className="username">User {userId}</span>
                        <span className="timestamp">· {timeAgo}</span>
                    </div>
                </div>
                <button className="more-btn">⋯</button>
            </div>

            <div className="post-content">
                {header && header !== "1" && (
                    <h2 className="post-title">{header}</h2>
                )}
                <p className="post-text">{text}</p>
            </div>

            <div className="post-footer">
                <div className="action-btns">
                    <button className="action like">
                        <span className="icon"><FaHeart/></span>
                        <span>{likes.length}</span>
                    </button>

                    <button className="action comment">
                        <span className="icon"><FaComment /></span>
                        <span>{comments.length}</span>
                    </button>

                    <button className="action view">
                        <span className="icon"><FaEye /></span>
                        <span>{views.toLocaleString()}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
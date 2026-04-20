import { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaUser, FaPaperPlane } from 'react-icons/fa';
import { supabase } from '../utils/supabaseClient';
import '../styles/ShareModal.css';
import addNote from '../utils/addNotification';

const ShareModal = ({ isOpen, onClose, postId, userData }) => {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!search.trim()) {
            setUsers([]);
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('users')
                .select('id, name, avatar')
                .ilike('name', `%${search}%`)
                .neq('id', userData.id)
                .limit(5);
            setUsers(data || []);
            setLoading(false);
        };

        const timer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timer);
    }, [search, userData.id]);

    const handleSend = async (targetUser) => {
        try {
            // Check for existing chat
            const { data: existingChats } = await supabase
                .from('chats')
                .select('*')
                .contains('participants', [userData.id, targetUser.id]);
            
            let chat = existingChats?.find(c => c.participants.length === 2);

            if (!chat) {
                const { data: newChat } = await supabase
                    .from('chats')
                    .insert([{ participants: [userData.id, targetUser.id] }])
                    .select()
                    .single();
                chat = newChat;
            }

            // Send message with post link
            await supabase.from('messages').insert([{
                chat_id: chat.id,
                sender_id: userData.id,
                video_id: postId,
                text: `Shared a post with you!`
            }]);

            addNote("Sent!", `Post shared with ${targetUser.name}`, userData.id);
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal-content" onClick={e => e.stopPropagation()}>
                <div className="share-modal-header">
                    <h3>Send to</h3>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="share-search">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="share-users-list">
                    {loading ? (
                        <div className="share-loading">Searching...</div>
                    ) : users.length > 0 ? (
                        users.map(user => (
                            <div key={user.id} className="share-user-item">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        {user.avatar ? <img src={user.avatar} alt="avatar" /> : <FaUser />}
                                    </div>
                                    <span className="user-name">{user.name}</span>
                                </div>
                                <button className="send-btn" onClick={() => handleSend(user)}>
                                    <FaPaperPlane /> Send
                                </button>
                            </div>
                        ))
                    ) : search.trim() ? (
                        <div className="no-users">No users found.</div>
                    ) : (
                        <div className="share-hint">Type a name to search</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;

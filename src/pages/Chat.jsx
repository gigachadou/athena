import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FaUser, FaSearch, FaArrowLeft } from "react-icons/fa";
import "../styles/chatStyles.css";

export default function Chat() {
    const { userData } = useOutletContext();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!userData) return;

        const fetchChats = async () => {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .contains('participants', [userData.id])
                .order('last_message_time', { ascending: false });

            if (!error) {
                // Fetch other participant info for each chat
                const chatsWithInfo = await Promise.all(data.map(async (chat) => {
                    const otherId = chat.participants.find(id => id !== userData.id);
                    const { data: user } = await supabase.from('users').select('name, avatar').eq('id', otherId).single();
                    return { ...chat, otherUser: user, otherId };
                }));
                setChats(chatsWithInfo);
            }
            setLoading(false);
        };

        fetchChats();

        // Subscribe to changes
        const channel = supabase.channel('chat_list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
                fetchChats();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [userData]);

    const filteredChats = chats.filter(c => 
        c.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="chat-list-page">
            <div className="chat-header">
                <button onClick={() => navigate(-1)} className="back-btn"><FaArrowLeft /></button>
                <h2>Messages</h2>
            </div>

            <div className="search-bar">
                <FaSearch />
                <input 
                    type="text" 
                    placeholder="Search messages" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="chats-container">
                {loading ? (
                    <div className="loading">Loading conversations...</div>
                ) : filteredChats.length > 0 ? (
                    filteredChats.map(chat => (
                        <div key={chat.id} className="chat-item" onClick={() => navigate(`/chat/${chat.id}`)}>
                            <div className="chat-avatar">
                                {chat.otherUser?.avatar ? (
                                    <img src={chat.otherUser.avatar} alt="v" />
                                ) : (
                                    <FaUser />
                                )}
                            </div>
                            <div className="chat-info">
                                <div className="chat-name">{chat.otherUser?.name || "User"}</div>
                                <div className="chat-last-msg">{chat.last_message || "No messages yet"}</div>
                            </div>
                            <div className="chat-meta">
                                {chat.last_message_time && (
                                    <div className="chat-time">
                                        {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-chats">No messages found.</div>
                )}
            </div>
        </div>
    );
}

import { useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane, FaPlayCircle, FaUser } from "react-icons/fa";
import "../styles/chatStyles.css";

export default function ChatDetail() {
    const { chatId } = useParams();
    const { userData } = useOutletContext();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!userData || !chatId) return;

        const fetchData = async () => {
            // 1. Fetch Chat Info & Other User
            const { data: chat } = await supabase.from('chats').select('*').eq('id', chatId).single();
            if (chat) {
                const otherId = chat.participants.find(id => id !== userData.id);
                const { data: user } = await supabase.from('users').select('name, avatar').eq('id', otherId).single();
                setOtherUser(user);
            }

            // 2. Fetch Messages
            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });
            
            setMessages(msgs || []);
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        };

        fetchData();

        // 3. Subscribe to new messages
        const channel = supabase.channel(`chat_${chatId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages', 
                filter: `chat_id=eq.${chatId}` 
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
                setTimeout(scrollToBottom, 100);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [chatId, userData]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        const msgText = text.trim();
        setText("");

        try {
            const { error: msgError } = await supabase.from('messages').insert([{
                chat_id: chatId,
                sender_id: userData.id,
                text: msgText
            }]);

            if (msgError) throw msgError;

            // Update chat's last message
            await supabase.from('chats').update({
                last_message: msgText,
                last_message_time: new Date().toISOString()
            }).eq('id', chatId);

        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    if (loading) return <div className="loading">Loading chat...</div>;

    return (
        <div className="chat-detail-page">
            <div className="chat-detail-header">
                <button onClick={() => navigate(-1)} className="back-btn"><FaArrowLeft /></button>
                <div className="user-info-chat">
                    {otherUser?.avatar ? <img src={otherUser.avatar} /> : <div className="def-av"><FaUser /></div>}
                    <span>{otherUser?.name || "User"}</span>
                </div>
            </div>

            <div className="messages-list">
                {messages.map(msg => {
                    const isMe = msg.sender_id === userData.id;
                    return (
                        <div key={msg.id} className={`message-bubble ${isMe ? 'me' : 'other'}`}>
                            {msg.video_id ? (
                                <div className="shared-video" onClick={() => navigate(`/posts/${msg.video_id}`)}>
                                    <FaPlayCircle size={30} />
                                    <span>Shared Video</span>
                                </div>
                            ) : (
                                <div className="msg-text">{msg.text}</div>
                            )}
                            <div className="msg-time">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form className="message-form" onSubmit={handleSendMessage}>
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                />
                <button type="submit" disabled={!text.trim()}><FaPaperPlane /></button>
            </form>
        </div>
    );
}

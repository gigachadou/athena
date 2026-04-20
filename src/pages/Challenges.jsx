import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FaTrophy, FaUsers, FaCoins, FaInfoCircle, FaArrowLeft } from "react-icons/fa";
import "../styles/challenges.css";

const ChallengeCard = ({ challenge, userData, onJoin }) => {
    const isJoined = challenge.participants?.includes(userData?.id);
    const isCompleted = challenge.status === 'completed';

    return (
        <div className={`challenge-card ${isCompleted ? 'completed' : ''}`}>
            <div className="challenge-header">
                <FaTrophy className="trophy-icon" />
                <h3>{challenge.title}</h3>
                <span className={`status-badge ${challenge.status}`}>{challenge.status}</span>
            </div>
            <p className="challenge-desc">{challenge.description}</p>
            <div className="challenge-meta">
                <div className="meta-item">
                    <FaCoins />
                    <span>Entry: ${challenge.entry_fee}</span>
                </div>
                <div className="meta-item">
                    <FaUsers />
                    <span>{challenge.participants?.length || 0} participants</span>
                </div>
                <div className="meta-item prize">
                    <FaCoins />
                    <span>Pool: ${challenge.prize_pool}</span>
                </div>
            </div>
            {!isCompleted && (
                <button 
                    className={`join-btn ${isJoined ? 'joined' : ''}`}
                    onClick={() => !isJoined && onJoin(challenge)}
                    disabled={isJoined}
                >
                    {isJoined ? 'Joined' : 'Join Challenge'}
                </button>
            )}
            {isCompleted && challenge.winner_id && (
                <div className="winner-announcement">
                    Winner ID: {challenge.winner_id}
                </div>
            )}
        </div>
    );
};

export default function Challenges() {
    const [challenges, setChallenges] = useState([]);
    const { userData, setUserData } = useOutletContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchChallenges() {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (!error) setChallenges(data || []);
            setLoading(false);
        }
        fetchChallenges();
    }, []);

    const handleJoin = async (challenge) => {
        if (!userData) return navigate("/login");
        
        if (userData.balance < challenge.entry_fee) {
            setError("Balansingiz yetarli emas! Iltimos hisobingizni to'ldiring.");
            setTimeout(() => setError(""), 5000);
            return;
        }

        try {
            const newBalance = userData.balance - challenge.entry_fee;
            const newParticipants = [...(challenge.participants || []), userData.id];
            const newPrizePool = challenge.prize_pool + challenge.entry_fee;

            // 1. Update user balance
            const { error: userError } = await supabase
                .from('users')
                .update({ balance: newBalance })
                .eq('id', userData.id);

            if (userError) throw userError;

            // 2. Update challenge participants and prize pool
            const { error: challengeError } = await supabase
                .from('challenges')
                .update({ 
                    participants: newParticipants,
                    prize_pool: newPrizePool
                })
                .eq('id', challenge.id);

            if (challengeError) throw challengeError;

            // 3. Update local state
            setUserData(prev => ({ ...prev, balance: newBalance }));
            setChallenges(prev => prev.map(c => 
                c.id === challenge.id 
                ? { ...c, participants: newParticipants, prize_pool: newPrizePool } 
                : c
            ));
            
            alert("Siz challengega muvaffaqiyatli qo'shildingiz!");
        } catch (err) {
            setError("Xatolik yuz berdi: " + err.message);
        }
    };

    if (loading) return <div className="loading">Loading Challenges...</div>;

    return (
        <div className="challenges-page">
            <div className="challenges-header">
                <button onClick={() => navigate(-1)} className="back-btn"><FaArrowLeft /></button>
                <h1>Challenges</h1>
                <div className="user-balance">
                    <FaCoins />
                    <span>Balance: ${userData?.balance || 0}</span>
                </div>
            </div>

            {error && <div className="challenge-error">{error}</div>}

            <div className="challenges-info">
                <FaInfoCircle />
                <p>Challengesda qatnashib pul yutib oling! Har bir ishtirokchi puli umumiy fondga qo'shiladi.</p>
            </div>

            <div className="challenges-list">
                {challenges.length > 0 ? (
                    challenges.map(c => (
                        <ChallengeCard 
                            key={c.id} 
                            challenge={c} 
                            userData={userData} 
                            onJoin={handleJoin} 
                        />
                    ))
                ) : (
                    <div className="no-challenges">
                        Hozirda faol challengelar yo'q. Tez kunda kuting!
                    </div>
                )}
            </div>
        </div>
    );
}

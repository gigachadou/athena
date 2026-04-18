import { FaUser, FaBell } from "react-icons/fa";
import "../styles/home.css"
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import logOutHandler from "../utils/logOutHandler";
import { BiExit } from "react-icons/bi";
import { supabase } from "../utils/supabaseClient";

export default function Home() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate()
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");
    const [hasUnread, setHasUnread] = useState(false);
    const { userData } = useOutletContext();

    useEffect(() => {
        if (userData) {
            async function checkNotifications() {
                const { data } = await supabase
                    .from('notifications')
                    .select('id')
                    .eq('userid', userData.id)
                    .eq('isread', false);
                if (data && data.length > 0) setHasUnread(true);
            }
            checkNotifications();
        }
    }, [userData]);

    useEffect(() => {
        async function getData() {
            try {
                if (userData) {
                    setUser(userData);
                    const followingIds = userData.followings || [];
                    
                    const { data: allPosts, error: postsError } = await supabase
                        .from('posts')
                        .select('*');

                    if (postsError) throw postsError;

                    // --- PRO ALGORITHM ---
                    // 1. Identify user's favorite authors (based on past likes)
                    const userLikedPosts = allPosts.filter(p => p.likes?.includes(userData.id));
                    const authorAffinity = {};
                    userLikedPosts.forEach(p => {
                        authorAffinity[p.userid] = (authorAffinity[p.userid] || 0) + 1;
                    });

                    const gravity = 1.8; // Time decay factor
                    const now = Date.now();

                    const scoredPosts = (allPosts || []).map(post => {
                        let points = 0;
                        
                        // A. Base points from engagement
                        const likes = post.likes?.length || 0;
                        const views = post.views || 0;
                        const engagementRate = views > 0 ? (likes / views) : 0;
                        points += likes * 15;
                        points += engagementRate * 500;

                        // B. Social Multipliers
                        if (followingIds.includes(post.userid)) {
                            points *= 2.5; // Huge boost for followings
                        }
                        
                        // C. Affinity Multiplier (User's favorites)
                        const affinity = authorAffinity[post.userid] || 0;
                        points *= (1 + (affinity * 0.2));

                        // D. Time Decay (Gravity formula)
                        const hoursSinceCreated = (now - new Date(post.createdat).getTime()) / (1000 * 60 * 60);
                        const score = points / Math.pow(hoursSinceCreated + 2, gravity);

                        return { ...post, score };
                    });

                    // Sort by final score
                    const sortedPosts = scoredPosts.sort((a, b) => b.score - a.score);

                    setPosts(sortedPosts);
                    setError("");
                }
            } catch (error) {
                setError(error.message);
            }
        }

        getData();
    }, [userData]);

    if (error) {
        return <h2>{error}</h2>
    }

    return (
        <div className="home">
            <div className="home-header">
                <div className="home-about">
                    {!user?.avatar ? <FaUser /> : <img src={user.avatar} alt="User Image" />}
                    <div className="home-user">
                        <h2>{user?.name ? user.name : "loading..."}</h2>
                        <p>{user?.email ? user.email : "loading..."}</p>
                    </div>
                </div>
                <div className="home-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                     <Link to="/notification" style={{ color: "var(--ig-text-primary)", fontSize: "20px", position: "relative" }}>
                        <FaBell />
                        {hasUnread && <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "8px", height: "8px", background: "red", borderRadius: "50%", border: "2px solid var(--ig-surface)" }}></span>}
                     </Link>
                </div>
                <div className="home-search">
                    <div className="form-control">
                        <input className="input input-alt" placeholder="Search friends" required="" type="text" onChange={(e) => { navigate(`/search/${e.target.value}`) }} />
                        <span className="input-border input-border-alt"></span>
                    </div>

                </div>
            </div>
            <div className="home-body">

                <div className="home-post">
                    {
                        posts.map(post => (
                            <div className="post" key={post.id}>
                                <PostCard
                                    post={post}
                                />
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};
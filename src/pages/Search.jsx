import { FaSearch, FaUser } from "react-icons/fa";
import "../styles/searchPage.css";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Friends from "../components/Friends";
import { supabase } from "../utils/supabaseClient";

function Search() {
    const [friends, setFriends] = useState([]);
    const { name } = useParams();
    const [elements, setElements] = useState([]);
    const [postResults, setPostResults] = useState([]);
    const [query, setQuery] = useState(name || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { userData } = useOutletContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (name) {
            setQuery(name);
            handleSearch(name);
        }
    }, [name]);

    useEffect(() => {
        async function getRecommended() {
            const { data } = await supabase.from('users').select('*').limit(5);
            setFriends(data || []);
        }
        getRecommended();
    }, []);

    async function handleSearch(v) {
        if (!v.trim()) {
            setElements([]);
            setPostResults([]);
            return;
        }

        setLoading(true);
        const id = userData?.id;
        try {
            // Search Users
            const { data: usersData } = await supabase
                .from('users')
                .select('*')
                .or(`name.ilike.%${v}%,email.ilike.%${v}%`)
                .neq('id', id || 0);

            // Search Posts
            const { data: postsData } = await supabase
                .from('posts')
                .select('*')
                .or(`header.ilike.%${v}%,text.ilike.%${v}%`)
                .limit(10);

            setElements(usersData || []);
            setPostResults(postsData || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="search__header">
                <input
                    type="search"
                    value={query}
                    placeholder="Search people or posts..."
                    onChange={(e) => {
                        setQuery(e.target.value);
                        handleSearch(e.target.value);
                    }}
                />
                <label><FaSearch /></label>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ig-text-secondary)' }}>Searching...</div>}

            {!query && friends.length > 0 && (
                <div className="recommendations">
                    <h3 style={{ padding: '0 20px', fontSize: '14px', color: 'var(--ig-text-secondary)' }}>Suggested</h3>
                    <div className="search-friends">
                        {friends.map(friend => <Friends friendsData={friend} key={friend.id} />)}
                    </div>
                </div>
            )}

            <div className="results">
                {elements.length > 0 && <h3 className="section-title">Users</h3>}
                {elements.map((item) => (
                    <div key={item.id} className="search-result-item" onClick={() => navigate(`/searchresultusers/${item.id}`)}>
                        <div className="searchImg">
                            {!item?.avatar ? <FaUser /> : <img src={item.avatar} alt="Avatar" />}
                        </div>
                        <div className="searchInfo">
                            <h2>{item.name}</h2>
                            <p>{item.email}</p>
                        </div>
                    </div>
                ))}

                {postResults.length > 0 && <h3 className="section-title" style={{ marginTop: '20px' }}>Posts</h3>}
                {postResults.map((post) => (
                    <div key={post.id} className="search-result-item post-res" onClick={() => navigate(`/posts/${post.id}`)}>
                        <div className="searchImg post-img">
                             {post.media?.[0] ? (
                                 post.media[0].match(/\.(mp4|webm|ogg|mov)$/i) ? <div className="video-thumb"><FaSearch /></div> : <img src={post.media[0]} alt="Post" />
                             ) : <FaSearch />}
                        </div>
                        <div className="searchInfo">
                            <h2>{post.header || "Post"}</h2>
                            <p>{post.text?.substring(0, 50)}...</p>
                        </div>
                    </div>
                ))}

                {query && !loading && elements.length === 0 && postResults.length === 0 && (
                    <div className="no-results">No results found for "{query}"</div>
                )}
            </div>
        </div>
    );
};

export default Search;
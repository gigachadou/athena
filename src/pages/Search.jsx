import { FaSearch, FaUser } from "react-icons/fa";
import "../styles/searchPage.css";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Friends from "../components/Friends";
import { supabase } from "../utils/supabaseClient";

function Search() {
    const [friends, setFriends] = useState([]);
    let { name } = useParams();
    const [elements, setElements] = useState([]);
    const [query, setQuery] = useState(name || "");
    const [error, setError] = useState("");
    const { userData } = useOutletContext();
    let navigate = useNavigate();

    useEffect(() => {
        async function getFriends() {
            try {
                if (!userData) return;
                let id = userData.id;

                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .neq('id', id)
                    .limit(10);

                if (error) throw error;
                setFriends(data || []);
                setError("")
            } catch (error) {
                setError(error.message)
            };
        };
        if (userData) getFriends();
    }, [userData]);

    async function handleSearch(v) {
        if (v.length === 0) {
            setElements([]);
            return;
        }

        if (!userData) return;

        let id = userData.id;
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .or(`name.ilike.%${v}%,email.ilike.%${v}%`)
                .neq('id', id);

            if (error) throw error;
            setElements(data || []);
        } catch (error) {
            setError(error.message);
        };
    };

    function results(id) {
        navigate(`/searchresultusers/${id}`);
    };
    return (
        <div className="container">
            <div className="search__header">
                <input
                    type="search"
                    value={query}
                    placeholder="Search for your friends..."
                    onChange={(e) => {
                        setQuery(e.target.value);
                        handleSearch(e.target.value);
                    }}
                />
                <label htmlFor="searchInput">
                    <FaSearch />
                </label>
            </div>
            <p>{error}</p> {/* test u-n */}
            <div className="search-friends">
                {friends.map(friend => {
                    return (<Friends friendsData={friend} key={friend.id} />)
                })}
            </div>

            <div className="results">
                {elements.map((item) => (
                    <div key={item.id} onClick={() => results(item.id)}>
                        <div className="searchImg">
                            {!item?.avatar ? <FaUser /> : <img src={item.avatar} alt="Users avatar" />}
                        </div>
                        <div className="searchInfo">
                            <h2>{item.name}</h2>
                            <p>{item.email}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Search;
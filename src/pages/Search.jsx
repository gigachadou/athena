import { FaSearch, FaUser } from "react-icons/fa";
import "../styles/searchPage.css";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Friends from "../components/Friends";

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
                let id = userData.id;
                let friendRes = await fetch(`http://localhost:3000/users?_limit=10`);
                if (!friendRes.ok) throw new Error("Friends not found");
                let dataFriend = await friendRes.json();
                let filteredFriends = dataFriend.filter(item => item.id !== id);

                setFriends(filteredFriends);
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
            const res = await fetch(
                `http://localhost:5000/users?search=${v}`
            );

            if (!res.ok) throw new Error("Server is not responding");
            const info = await res.json();
            const data = info.users.filter(item => item.id != id)
            setElements(data || []);
        } catch (error) {};
    };

    function results(id) {
        navigate(`/searchresultusers/${id}`);
    };
    return (
        <div>
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
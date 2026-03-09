import { FaSearch, FaUser } from "react-icons/fa";
import "../styles/searchPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
    const [elements, setElements] = useState([]);
    let navigate = useNavigate();

    async function handleSearch(v) {
        if (v.length === 0) {
            setElements([]);
            return;
        }
        let response = localStorage.getItem("loginConf");
        let parsed = JSON.parse(response);
        let id = parsed.user.id
        try {
            const res = await fetch(
                `http://localhost:5000/users?search=${v}`
            );

            if (!res.ok) throw new Error("Server is not responding");
            const info = await res.json();
            const data = info.users.filter(item => item.id != id)
            setElements(data || []);
        } catch (error) {
            console.log(error);
        };
    };

    function results(id){
        navigate(`/searchresultusers/${id}`)
    }
    return (
        <div>
            <div className="search__header">
                <input
                    type="search"
                    placeholder="Search for your friends..."
                    id="searchInput"
                    onInput={(e) => handleSearch(e.target.value)}
                />
                <label htmlFor="searchInput">
                    <FaSearch />
                </label>
            </div>

            <div className="results">
                {elements.map((item) => (
                    <div key={item.id} onClick={()=>results(item.id)}>
                        <div className="searchImg">
                            {!item?.avatar ? <FaUser/> : <img src={item.avatar} alt="Users avatar" />}
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
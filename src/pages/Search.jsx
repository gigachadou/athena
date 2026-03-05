import { FaSearch } from "react-icons/fa";
import "../styles/searchPage.css";
import { useState } from "react";

function Search() {
    const [elements, setElements] = useState([]);

    async function handleSearch(v) {
        const response = localStorage.getItem("loginConf");
        const token = JSON.parse(response).accessToken;

        try {
            const res = await fetch(
                `http://localhost:5000/users?search=${v}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) throw new Error("User olishda xatolik ketdi");

            const data = await res.json();
            setElements(data.users || []);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <div className="search__header">
                <input
                    type="search"
                    placeholder="Do'stlaringizni qidiring..."
                    id="searchInput"
                    onInput={(e) => handleSearch(e.target.value)}
                />
                <label htmlFor="searchInput">
                    <FaSearch />
                </label>
            </div>

            <div className="results">
                {elements.map((item) => (
                    <div key={item.id}>
                        <h2>Name: {item.name}</h2>
                        <p>email: {item.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Search;
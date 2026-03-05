import { FaSearch } from "react-icons/fa";
import "../styles/searchPage.css";
import { useState } from "react";

function Search() {
    const [elements, setElements] = useState([]);

    async function handleSearch(v) {
        try {
            const res = await fetch(
                `http://localhost:5000/users?search=${v}`,
                // {                                            // tegma xozircha ishlayapti!
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // }
            );

            if (!res.ok) throw new Error("Server is not responding");
            console.log(res);
            const data = await res.json();
            setElements(data.users || []);
        } catch (error) {
            console.log(error);
        };
    };

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
                    <div key={item.id}>
                        <h2>Name: {item.name}</h2>
                        <p>Email: {item.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Search;
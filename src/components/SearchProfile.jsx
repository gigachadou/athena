import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom"
import "../styles/searchresultuser.css"

function SearchProfile() {
    const [data, setData] = useState(null);
    const { usersID } = useParams();
    let navigate = useNavigate();
    useEffect(() => {
        async function getUsers(id) {
            const response = await fetch(`http://localhost:3000/users/${id}`);
            const data = await response.json();
            setData(data);
        }
        getUsers(usersID)
    }, [usersID])
    return <div className="searchresultsuser">
        <div className="userinfo">
            <div className="userimg">
                {!data?.avatar ? <FaUser /> : <img src={data.avatar} />}
            </div>
            <div className="usertext">
                <h2>{data?.name ? data.name : "UserName"}</h2>
                <p>{data?.email ? data.email : "UserEmail"}</p>
            </div>
            <div className="follow-btn">
                <button>Follow</button>
                <button onClick={()=>navigate("/search")}>Ortga</button>
            </div>
        </div>
    </div>
}

export default SearchProfile
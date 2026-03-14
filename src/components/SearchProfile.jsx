import { useEffect, useState } from "react";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom"
import "../styles/searchresultuser.css"
import PostCard from "./PostCard";
import getPostsByIds from "../utils/getPostsByIds";

function SearchProfile() {
    const [data, setData] = useState(null);
    const [posts, setPosts] = useState([]);
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

    useEffect(() => {
        (async function () {
            if (data) {
                const response = await getPostsByIds(data.posts);
                setPosts(response);
            };
        })();
    }, [data]);

    if (!data) {
        return <div>Loading...</div>
    };
    return <div className="profile-page">
        <button onClick={() => navigate("/search")} className="back"><FaArrowLeft /></button>
        <div className="UserInfo">
            <div className="avatar">
                {!data?.avatar ? <FaUser /> : <img src={data.avatar} />}
            </div>
            <div className="bio">
                <div className="name">
                    <h2>{data?.name ? data.name : "UserName"}</h2>
                    <p>{data?.email ? data.email : "UserEmail"}</p>
                    <p>{data?.bio ? data.bio : "not bio yet"}</p>
                </div>
                <div className="following">
                    <button>Follow</button>
                </div>
            </div>
        </div>
        <div className="posts">
            {data?.posts?.[0] ? posts.map(e => <PostCard post={e} userData={data} key={e.id} />) : "No posts yet"}
        </div>
    </div>
}

export default SearchProfile
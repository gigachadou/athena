import { FaUser } from "react-icons/fa";
import "../styles/home.css"
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { useNavigate, useOutletContext } from "react-router-dom";

export default function Home() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate()
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");
    const { userData } = useOutletContext();

    useEffect(() => {
        async function getData() {
            try {
                let data = userData;

                let postRes = await fetch(`http://localhost:3000/posts?_limit=15`);
                let userRes = await fetch(`http://localhost:3000/users`);

                if (!postRes.ok || !userRes.ok) {
                    throw new Error("Data not loading please refresh page");
                }

                let dataPosts = await postRes.json();
                let users = await userRes.json();

                let filteredPosts = dataPosts.filter(item => item.userId !== data.id);

                setUser(data);
                setPosts(
                    filteredPosts.map(post => ({
                        ...post,
                        userData: users.find(user => user.id === post.userId)
                    }))
                );

                setError("");
            } catch (error) {
                setError(error.message);
            }
        }

        if (userData) getData();
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
                <div className="home-search">
                    <div className="form-control">
                        <input className="input input-alt" placeholder="Search friends" required="" type="text" onChange={(e)=>{navigate(`/search/${e.target.value}`)}}/>
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
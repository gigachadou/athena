import { useEffect, useState } from "react"
import { FaCog, FaEdit, FaHamburger, FaServer, FaUser } from "react-icons/fa"
import "../styles/profile.css"
import EditModal from "../components/EditModal";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [data, setData] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        async function getUserData() {
            const idJson = localStorage.getItem("loginConf");
            const id = JSON.parse(idJson)
            const response = await fetch(`http://localhost:3000/users/${id.user.id}`);
            const data = await response.json();
            setData(data);
        }
        getUserData()
    } , [])
    if(!data){
        return <div>Loading...</div>
    }
    return <div className="profile-page">
        <div className="profile-buttons">
            <button onClick={() => setIsOpen(true)}><FaEdit/></button>
        <button onClick={()=>navigate("/settings")}><FaCog/></button>
        </div>
        {isOpen && <EditModal closeModal={setIsOpen} UserId={data.id} data={setData}/>}
        <div className="UserInfo">
            <div className="avatar">
                {!data.avatar ? <FaUser /> : <img src={data.avatar} alt="User avatar"/>}
            </div>
            <div className="bio">
                <div className="name">
                    <h2>{data.name}</h2>
                    <p>{data.email}</p>
                    <p>{!data.bio ? "..." : data.bio}</p>
                </div>
                <div className="following">
                    <p>Followers: {data.followers ? data.followers.length : 0}</p>
                    <p>Followings: {data.followings ? data.followings.length : 0}</p>
                </div>
            </div>
        </div>
        <h2 className="posts-h2">Posts</h2>
        <div className="posts">
            {!data.posts ? "sizda hozircha postlar yoq" : "postlarni korishingiz mumkin"}
        </div>
    </div>
}

export default Profile
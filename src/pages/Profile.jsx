import { useEffect, useState } from "react"
import { FaCog, FaEdit, FaHamburger, FaServer, FaUser } from "react-icons/fa"
import "../styles/profile.css"
import EditModal from "../components/EditModal";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

function Profile() {
    const { userData, setUserData } = useOutletContext();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    if (!userData) {
        return <div>Loading...</div>
    }

    useEffect(() => {

    }, [userData])

    return <div className="profile-page">
        <div className="profile-buttons">
            <button onClick={() => setIsOpen(true)}><FaEdit /></button>
            <button onClick={() => navigate("/settings")}><FaCog /></button>
        </div>
        {isOpen && <EditModal closeModal={setIsOpen} UserId={userData.id} data={setUserData} />}
        <div className="UserInfo">
            <div className="avatar">
                {!userData.avatar ? <FaUser /> : <img src={userData.avatar} alt="User avatar" />}
            </div>
            <div className="bio">
                <div className="name">
                    <h2>{userData.name}</h2>
                    <p>{userData.email}</p>
                    <p>{!userData.bio ? "..." : userData.bio}</p>
                </div>
                <div className="following">
                    <p>Followers: {userData.followers.length}</p>
                    <p>Followings: {userData.followings.length}</p>
                </div>
            </div>
        </div>
        <h2 className="posts-h2">Posts</h2>
        <div className="posts">
            {!userData.posts?.[0] ? <Link to={"/addPost"}>Create your first post</Link> : ""} {/*< hali tugamadi tegma yoki utils/checkUserExistance.js bilan tugatib qo'y */}
        </div>
    </div>
};

export default Profile;
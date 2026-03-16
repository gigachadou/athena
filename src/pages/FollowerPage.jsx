import { FaArrowLeft } from "react-icons/fa"
import "../styles/followerpage.css"
import FollowPeople from "../components/FollowUser"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react";

function FollowerPage() {
    const { order, userID } = useParams();
    let navigate = useNavigate()
    const [followsID, setFollowsID] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        async function getUserFollowerID() {
            try {
                if (order) {
                    const response = await fetch(`http://localhost:3000/users/${userID}`);

                    if (!response.ok) throw new Error("Server not working , please wait or upload page")
                    let user = await response.json();

                    let followersID = user[order] || [];
                    if (!followersID) throw new Error('Not follower')
                    setUser(user)
                    setFollowsID(followersID);
                    setError('')
                }
                else throw new Error("Please enter order")
            } catch (error) {
                setError(error.message)
            }
        }
        getUserFollowerID()
    }, [userID])

    if (!user) return <div>
        <h2>Loading...</h2>
        <p>please wait</p>
    </div>
    return (<>
        {!error ? <div className="followers-page">
            <div className="controller">
                <FaArrowLeft onClick={() => navigate('/profile')} />
                <h2>{!user?.name ? "Not User" : `${user.name} ${order}`}</h2>
            </div>
            {followsID.length === 0 ? <h2>Not follower yet</h2> : followsID.map(follower => <FollowPeople id={follower} key={follower} />)}
        </div> : <h2>{error}</h2>}
    </>)
}

export default FollowerPage
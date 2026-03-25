import { useEffect, useState } from "react"
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/followPeople.css"

function FollowPeople({ id }){
    const [followerData , setFollowerData] = useState(null);
    let navigate = useNavigate();

    useEffect(()=>{
        async function getFollowerData() {
            const response = await fetch(`http://localhost:3000/users/${id}`);
            let followerData = await response.json();

            setFollowerData(followerData)
        }
        getFollowerData()
    } , [])
    
    return (
        <div className="followerCard">
            <div className="img">
                {!followerData?.avatar ? <FaUser/> : <img src={followerData.avatar} alt="Follower avatar" />}
            </div>
            <div className="follower-info">
                <h2>{!followerData?.name ? "Loading..." : followerData.name}</h2>
                <p>{!followerData?.email ? "Loading..." : followerData.email}</p>
            </div>
            <button onClick={()=>{navigate(`/searchresultusers/${id}`)}}>View Follower</button>
        </div>)
}

export default FollowPeople
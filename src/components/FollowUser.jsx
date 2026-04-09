import { useEffect, useState } from "react"
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/followPeople.css"
import { supabase } from "../utils/supabaseClient";

function FollowPeople({ id }){
    const [followerData , setFollowerData] = useState(null);
    let navigate = useNavigate();

    useEffect(()=>{
        async function getFollowerData() {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (!error) {
                setFollowerData(data)
            }
        }
        getFollowerData()
    } , [id])
    
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
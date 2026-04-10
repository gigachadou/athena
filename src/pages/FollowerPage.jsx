import { FaArrowLeft } from "react-icons/fa"
import "../styles/followerpage.css"
import FollowPeople from "../components/FollowUser"
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

function FollowerPage() {
    const { order, userID } = useParams();
    let navigate = useNavigate()
    const [followsID, setFollowsID] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const { userData } = useOutletContext();

    useEffect(() => {
        async function getUserFollowerID() {
            let id = userData.id;
            if (Number(userID) !== id) {
                setError("unauthorized access to other people's profiles is prohibited");
                return;
            }
            try {
                if (order) {
                    const { data: user, error: userError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', userID)
                        .single();

                    if (userError) throw userError;

                    let followersID = user[order] || [];
                    if (followersID.length === 0) throw new Error('Not follower')
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
    }, [userID, userData])

    if (error) return <div className="error-container">
        <h2>{error}</h2>
    </div>
    if (!user) return <div className="error-container">
        <h2>Loading...</h2>
        <p>please wait</p>
    </div>
    return (<>
        {!error ? <div className="followers-page">
            <div className="controller">
                <button onClick={() => navigate(-1)} className="back"><FaArrowLeft /></button>
                <h2>{!user?.name ? "Not User" : `${user.name} ${order}`}</h2>
            </div>
            {followsID.length === 0 ? <h2>Not follower yet</h2> : followsID.map(follower => <FollowPeople id={follower} key={follower} />)}
        </div> : <h2>{error}</h2>}
    </>)
}

export default FollowerPage
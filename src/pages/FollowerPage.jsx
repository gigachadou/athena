import { FaArrowLeft } from "react-icons/fa"
import "../styles/followerpage.css"
import FollowPeople from "../components/FollowUser"
import { useNavigate, useParams } from "react-router-dom"

function FollowerPage() {
    const {userID} = useParams();
    let navigate = useNavigate()

    //Hali tegma endi boshladim
    return <div className="followers-page">
        <div className="controller">
            <FaArrowLeft onClick={()=>navigate('/profile')}/>
            <h2>User ning followerlari</h2>
        </div>
        <FollowPeople/>
    </div>
}

export default FollowerPage
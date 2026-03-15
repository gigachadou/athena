import { FaUser } from "react-icons/fa"
import "../styles/friends.css"
import { useNavigate } from "react-router-dom"

function Friends({friendsData}){
    const navigate = useNavigate()
    return <div className="friends" onClick={()=>{navigate(`/searchresultusers/${friendsData.id}`)}}>
        {!friendsData?.avatar ? <FaUser/> : <img src={friendsData.avatar} alt="friends image"/>}
        <div className="friends-about">
            <h2>{friendsData.name}</h2>
            <button>View</button>
        </div>
    </div>
}

export default Friends
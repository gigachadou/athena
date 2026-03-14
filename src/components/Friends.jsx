import { FaUser } from "react-icons/fa"
import "../styles/friends.css"

function Friends({friendsData}){
    return <div className="friends">
        {!friendsData?.avatar ? <FaUser/> : <img src={friendsData.avatar} alt="friends image"/>}
        <div className="friends-about">
            <h2>{friendsData.name}</h2>
            <button>Follow</button>
        </div>
    </div>
}

export default Friends
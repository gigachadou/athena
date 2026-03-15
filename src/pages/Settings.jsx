import { useNavigate } from "react-router-dom"
import "../styles/settings.css"
import EditModal from "../components/EditModal";
import { useEffect, useState } from "react";

function Settings() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false)
    const [userData, setUserData] = useState(null);
    const [error , setError] = useState('');
    useEffect(() => {
        async function getUser() {
            try {
                let id = JSON.parse(localStorage.getItem("loginConf")).user.id;
                if(!id) throw new Error('User not logging yet')
                let res = await fetch(`http://localhost:3000/users/${id}`);
                if(!res.ok) throw new Error('User not found please login or upload page.')
                let data = await res.json();
                setUserData(data);
                setError('');
            } catch (error) {
                setError(error.message);
            }
        }
        getUser()
    }, [userData])

    function logOutHandler(e) {
        e.preventDefault();
        localStorage.clear();
        location.reload();
    };

    return <div className="settings">
        <button onClick={() => { setIsOpen(true) }}>Edit informations</button>
        {isOpen && <EditModal closeModal={setIsOpen} UserId={userData.id} data={setUserData} />}
        <button onClick={()=>{navigate("/aboutapplicationinformation")}}>About the developers</button>
        <button>Delete the account</button>
        <button onClick={logOutHandler}>Log out</button>
        <button onClick={() => navigate('/profile')}>Back</button>
    </div>
};

export default Settings;
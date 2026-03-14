import { useNavigate } from "react-router-dom"
import "../styles/settings.css"

function Settings() {
    const navigate = useNavigate();

    function logOutHandler(e) {
        e.preventDefault();
        localStorage.clear();
        location.reload();
    };

    return <div className="settings">
        <button>Edit informations</button>
        <button>About the developers</button>
        <button>Delete the account</button>
        <button onClick={logOutHandler}>Log out</button>
        <button onClick={() => navigate('/profile')}>Back</button>
    </div>
};

export default Settings;
import { useNavigate } from "react-router-dom"
import "../styles/settings.css"

function Settings() {
    const navigate = useNavigate();
    return <div className="settings">
        <button>Ma'lumotlarni tahrirlash</button>
        <button>Biz haqimizda</button>
        <button>Hisobni o'chirish</button>
        <button>Log out</button>
        <button onClick={()=>navigate('/profile')}>Orqaga</button>
    </div>
}

export default Settings
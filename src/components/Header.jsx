import { FaHome } from "react-icons/fa";
import { FaPersonRifle } from "react-icons/fa6";
import { Link } from "react-router-dom";


export default function Header() {
    return (
        <div className="header">
            <Link to="/"><FaHome/></Link>
            <Link to="/profile"><FaPersonRifle/></Link>
        </div>
    );
};
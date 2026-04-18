import { FaHome, FaPlus, FaSearch, FaUser, FaPlayCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/header.css"

export default function Header() {
    return (
        <div className="header">
            <Link to="/"><FaHome /></Link>
            <Link to="/search"><FaSearch /></Link>
            <Link to="/addPost"><FaPlus /></Link>
            <Link to="/shorts"><FaPlayCircle /></Link>
            <Link to="/profile"><FaUser /></Link>
        </div>
    );
};
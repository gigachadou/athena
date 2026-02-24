import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("loginConf");

    useEffect(() => {
        if (!isLoggedIn) navigate("/login");
    }, [isLoggedIn]);

    return isLoggedIn ? children : null;
};

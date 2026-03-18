import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                setError("Incorrect email or password!");
                throw new Error("server not responding!")
            };
            const data = await res.json();
            
            localStorage.setItem("loginConf", JSON.stringify(data));
            navigate("/home");
        } catch (error) { }
    }

    return (
        <div className="container login-container">
            <h3 className="login-header">Log In</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    {error && <div className="error-message">{error}</div>}
                    <label style={{ color: "black" }}>Email</label>
                    <input
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        type="email"
                        required
                    />
                </div>
                <div className="form-group">
                    <label style={{ color: "black" }}>Password</label>
                    <div className="password-wrapper">
                        <input
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEye/> : <FaEyeSlash/>}
                        </button>
                    </div>
                </div>
                <button type="submit" className="submit-btn">Log In</button>
            </form>
            <div className="signup-link">
                <span style={{ marginRight: "15px" }}>Or create one</span>
                <Link to="/signin">Sign In</Link>
            </div>
        </div>
    );
};
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser } from "../utils/authService";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await loginUser(email, password);
            navigate("/home");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        };
    };

    return (
        <div className="login-container">
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
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Wait..." : "Log In"}</button>
            </form>
            <div className="signup-link">
                <span style={{ marginRight: "15px" }}>Or create one</span>
                <Link to="/signin">Sign Up</Link>
            </div>
        </div>
    );
};
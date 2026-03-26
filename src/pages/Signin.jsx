import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Signin() {
    const [name, setName] = useState(localStorage.getItem("name") || "");
    const [email, setEmail] = useState(localStorage.getItem("email") || "");
    const [password, setPassword] = useState(localStorage.getItem("password") || "");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!name || !email || !password) {
            setError("Please fill out all the fields given");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, email: email, password: password, status: "user", posts: [], bio: "", followers: [], followings: [] }),
            });

            const data = await res.json();
            console.log(data);
            if (!res.ok) {
                throw new Error(data.message || "Failed to sign in!");
            };

            localStorage.setItem("loginConf", JSON.stringify(data));

            navigate("/home");
        } catch (err) {
            setError(err.message || "Error by server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="signin-container">
            <div className="signin-header">
                <h2>Sign In</h2>
            </div>

            <form onSubmit={handleSubmit} className="signin-form">
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        maxLength={40}
                        minLength={4}
                        placeholder="name"
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        placeholder="email@gmail.com"
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            minLength={8}
                            placeholder="*********"
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

                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? "Creating..." : "Sign In"}
                </button>

                <div className="signin-link">
                    <span style={{ marginRight: "15px" }}>Have an account?</span>
                    <Link to="/login">Log in</Link>
                </div>
            </form>
        </div>
    );
};

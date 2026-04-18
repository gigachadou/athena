import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { sendVerificationCode, verifyCode, registerUser } from "../utils/authService";

export default function Signin() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passRes, setPassRes] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Email verification state
    const [step, setStep] = useState("form"); // "form" | "verify" | "success"
    const [verifyCodeInput, setVerifyCodeInput] = useState("");
    const [countdown, setCountdown] = useState(0);

    const navigate = useNavigate();

    // Start countdown timer for resend
    function startCountdown() {
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    // Step 1: Validate form & send verification code
    async function handleSubmitForm(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!name || !email || !password) {
            setError("Please fill out all the fields given");
            setLoading(false);
            return;
        }

        // Password validation
        if (passRes !== password) {
            setError("Confirmation password have to match the password!");
            setLoading(false);
            return;
        };

        if (!(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password))) {
            setError("Password must contain atleast one special character: (!@#$%^&* etc.)");
            setLoading(false);
            return;
        } else if (!/[0-9]/.test(password)) {
            setError("Password must contain atleast one number");
            setLoading(false);
            return;
        } else if (!/[a-z]/.test(password)) {
            setError("Password must contain atleast lowercase letter");
            setLoading(false);
            return;
        } else if (!/[A-Z]/.test(password)) {
            setError("Password must contain atleast uppercase letter");
            setLoading(false);
            return;
        };
        // End of password validation

        try {
            await sendVerificationCode(email.trim(), name.trim());
            setStep("verify");
            startCountdown();
        } catch (err) {
            setError(err.message || "Error sending verification code");
        } finally {
            setLoading(false);
        };
    };

    // Step 2: Verify code & register
    async function handleVerifyCode(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const isValid = verifyCode(verifyCodeInput);
            if (!isValid) {
                setError("Invalid or expired code. Please try again.");
                setLoading(false);
                return;
            }

            // Code is correct — register the user
            await registerUser(name, email, password);
            setStep("success");

            // Redirect after short delay
            setTimeout(() => {
                navigate("/home");
            }, 1500);
        } catch (err) {
            setError(err.message || "Error creating account");
        } finally {
            setLoading(false);
        };
    };

    // Resend code
    async function handleResend() {
        if (countdown > 0) return;
        setError("");
        setLoading(true);
        try {
            await sendVerificationCode(email, name);
            startCountdown();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // ========== RENDER ==========

    // Success screen
    if (step === "success") {
        return (
            <div className="signin-container">
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                    <h2 style={{ marginBottom: "8px" }}>Account Created!</h2>
                    <p style={{ color: "#8e8e8e" }}>Redirecting to home...</p>
                </div>
            </div>
        );
    }

    // Verification code screen
    if (step === "verify") {
        return (
            <div className="signin-container">
                <div className="signin-header">
                    <h2>Verify Email</h2>
                </div>
                <p style={{ textAlign: "center", color: "#8e8e8e", marginBottom: "16px", fontSize: "14px" }}>
                    We sent a 6-digit code to <strong style={{ color: "#262626" }}>{email}</strong>
                </p>

                <form onSubmit={handleVerifyCode} className="signin-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Verification Code</label>
                        <input
                            type="text"
                            value={verifyCodeInput}
                            onChange={(e) => {
                                // Only allow digits, max 6
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setVerifyCodeInput(val);
                            }}
                            disabled={loading}
                            placeholder="000000"
                            maxLength={6}
                            style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px", fontWeight: "700" }}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || verifyCodeInput.length !== 6}
                        className="submit-btn"
                    >
                        {loading ? "Verifying..." : "Verify & Create Account"}
                    </button>

                    <div style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#8e8e8e" }}>
                        {countdown > 0 ? (
                            <span>Resend code in {countdown}s</span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={loading}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#0095f6",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    padding: 0
                                }}
                            >
                                Resend Code
                            </button>
                        )}
                    </div>

                    <div style={{ textAlign: "center", marginTop: "8px" }}>
                        <button
                            type="button"
                            onClick={() => { setStep("form"); setError(""); setVerifyCodeInput(""); }}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#8e8e8e",
                                fontSize: "13px",
                                cursor: "pointer",
                                padding: 0
                            }}
                        >
                            ← Go back & edit info
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Registration form (Step 1)
    return (
        <div className="signin-container">
            <div>
                <div className="signin-header">
                    <h2>Sign Up</h2>
                </div>

                <form onSubmit={handleSubmitForm} className="signin-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            maxLength={40}
                            minLength={2}
                            placeholder="name"
                            required
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
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={passRes}
                                onChange={(e) => setPassRes(e.target.value)}
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

                    <div className="form-group">
                        <label>Confirm your Password</label>
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
                        {loading ? "Sending code..." : "Continue"}
                    </button>

                    <div className="signin-link">
                        <span style={{ marginRight: "15px" }}>Have an account?</span>
                        <Link to="/login">Log in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

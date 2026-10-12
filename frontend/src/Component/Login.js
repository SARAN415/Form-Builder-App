import React, { useState } from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";

import "../Style/Auth.css";

function Login() {

    const navigate = useNavigate();

    const location = useLocation();


    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    // =========================================
    // Message received after signup
    // =========================================

    React.useEffect(() => {

        if (location.state?.message) {

            setSuccess(
                location.state.message
            );


            // Remove navigation state
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );
        }

    }, [location]);


    // =========================================
    // Validate
    // =========================================

    // const validateLogin = () => {

    //     if (!email.trim()) {

    //         setError(
    //             "Please enter your email or username."
    //         );

    //         return false;
    //     }


    //     if (!password) {

    //         setError(
    //             "Please enter your password."
    //         );

    //         return false;
    //     }


    //     return true;
    // };


    // =========================================
    // Login
    // =========================================

    const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
        setError("Please enter your email.");
        return;
    }

    if (!password) {
        setError("Please enter your password.");
        return;
    }

    setLoading(true);

    try {

        const response = await fetch(
            "http://localhost:8080/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            }
        );

        const result = await response.json();

        console.log("LOGIN RESPONSE:", result);
        console.log("LOGIN STATUS:", response.status);

        if (!response.ok) {

            setError(
                result.message ||
                "Invalid email or password."
            );

            return;
        }

        // Login successful.
        // JWT is NOT available yet.
        // Go to OTP page.

        navigate(
            "/otp-verification",
            {
                state: {
                    email: email.trim()
                }
            }
        );

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        setError(
            "Unable to connect to the server."
        );

    } finally {

        setLoading(false);
    }
};


    // =========================================
    // Google Login
    // =========================================

    const handleGoogleLogin = () => {

        window.location.href =
            "http://localhost:8080/oauth2/authorization/google";
    };


    // =========================================
    // UI
    // =========================================

    return (

        <div className="login-page">

            <div className="login-card">


                {/* =================================
                    Brand
                ================================== */}

                <div className="login-brand">

                    <div className="login-brand-logo">
                        ◇
                    </div>

                    <span>
                        FormBuilder
                    </span>

                </div>


                {/* =================================
                    Heading
                ================================== */}

                <h1>
                    Welcome back
                </h1>


                <p className="login-subtitle">
                    Sign in to your account to continue
                </p>


                {/* =================================
                    Login Form
                ================================== */}

                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >


                    {/* Email */}

                    <div className="login-form-group">

                        <label>
                            Email or Username
                        </label>


                        <div className="login-input-wrapper">

                            <span className="login-input-icon">
                                👤
                            </span>


                            <input
                                type="text"
                                value={email}
                                onChange={(e) => {

                                    setEmail(
                                        e.target.value
                                    );

                                    setError("");
                                }}
                                placeholder="Enter your email or username"
                                autoComplete="username"
                            />

                        </div>

                    </div>


                    {/* Password */}

                    <div className="login-form-group">

                        <label>
                            Password
                        </label>


                        <div className="login-input-wrapper">

                            <span className="login-input-icon">
                                🔒
                            </span>


                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) => {

                                    setPassword(
                                        e.target.value
                                    );

                                    setError("");
                                }}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />


                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >

                                {showPassword
                                    ? "◉"
                                    : "◌"}

                            </button>

                        </div>

                    </div>


                    {/* Forgot password */}

                    <div className="login-forgot-row">

                        <button
                            type="button"
                            className="login-forgot-button"
                            onClick={() =>
                                navigate(
                                    "/forgot-password"
                                )
                            }
                        >
                            Forgot password?
                        </button>

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    {/* Success */}

                    {success && (

                        <div className="auth-success">
                            {success}
                        </div>

                    )}


                    {/* Login */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Checking..."
                            : "Sign In"}

                    </button>


                    {/* Divider */}

                    <div className="login-divider">
                        OR
                    </div>


                    {/* Google */}

                    <button
                        type="button"
                        className="google-login-button"
                        onClick={handleGoogleLogin}
                    >

                        <span className="google-icon">
                            G
                        </span>

                        Continue with Google

                    </button>

                </form>


                {/* Signup */}

                <p className="login-signup-text">

                    Don't have an account?

                    <button
                        type="button"
                        className="login-signup-button"
                        onClick={() =>
                            navigate("/signup")
                        }
                    >
                        Sign up
                    </button>

                </p>

            </div>

        </div>
    );
}


export default Login;
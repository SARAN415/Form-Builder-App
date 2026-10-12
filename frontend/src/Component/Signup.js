import React, {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import "../Style/Auth.css";


function Signup() {

    const navigate =
        useNavigate();


    const [username, setUsername] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");


    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    // =========================================
    // Validation
    // =========================================

    const validateForm = () => {

        if (!username.trim()) {

            setError(
                "Please enter your username."
            );

            return false;
        }


        if (
            username.trim().length < 3
        ) {

            setError(
                "Username must contain at least 3 characters."
            );

            return false;
        }


        if (!email.trim()) {

            setError(
                "Please enter your email."
            );

            return false;
        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                email.trim()
            )
        ) {

            setError(
                "Please enter a valid email address."
            );

            return false;
        }


        if (!password) {

            setError(
                "Please enter a password."
            );

            return false;
        }


        if (password.length < 8) {

            setError(
                "Password must contain at least 8 characters."
            );

            return false;
        }


        if (
            password !==
            confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return false;
        }


        return true;
    };


    // =========================================
    // Signup
    // =========================================

    const handleSignup = async (e) => {

        e.preventDefault();

        setError("");


        if (!validateForm()) {

            return;
        }


        setLoading(true);


        try {

            const response =
                await fetch(
                    "http://localhost:8080/auth/signup",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            username:
                                username.trim(),

                            email:
                                email.trim(),

                            password:
                                password

                        })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                setError(
                    result.message ||
                    "Unable to create account."
                );

                return;
            }


            /*
             * Signup completed.
             *
             * Do not create JWT here.
             *
             * Go to Login.
             */

            navigate(
                "/login",
                {
                    state: {
                        message:
                            "Account created successfully. Please login."
                    }
                }
            );


        } catch (error) {

            console.error(
                "Signup error:",
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
    // UI
    // =========================================

    return (

        <div className="signup-page">

            <div className="signup-card">


                {/* =================================
                    Brand
                ================================== */}

                <div className="signup-brand">

                    <div className="signup-brand-logo">
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
                    Create your account
                </h1>


                <p className="signup-subtitle">
                    Start building forms with FormBuilder
                </p>


                {/* =================================
                    Signup Form
                ================================== */}

                <form
                    className="signup-form"
                    onSubmit={handleSignup}
                >


                    {/* Username */}

                    <div className="signup-form-group">

                        <label>
                            Username
                        </label>


                        <div className="signup-input-wrapper">

                            <span className="signup-input-icon">
                                👤
                            </span>


                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {

                                    setUsername(
                                        e.target.value
                                    );

                                    setError("");
                                }}
                                placeholder="Enter your username"
                                autoComplete="username"
                            />

                        </div>

                    </div>


                    {/* Email */}

                    <div className="signup-form-group">

                        <label>
                            Email
                        </label>


                        <div className="signup-input-wrapper">

                            <span className="signup-input-icon">
                                ✉
                            </span>


                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {

                                    setEmail(
                                        e.target.value
                                    );

                                    setError("");
                                }}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />

                        </div>

                    </div>


                    {/* Password */}

                    <div className="signup-form-group">

                        <label>
                            Password
                        </label>


                        <div className="signup-input-wrapper">

                            <span className="signup-input-icon">
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
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />


                            <button
                                type="button"
                                className="signup-password-toggle"
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


                    {/* Confirm Password */}

                    <div className="signup-form-group">

                        <label>
                            Confirm Password
                        </label>


                        <div className="signup-input-wrapper">

                            <span className="signup-input-icon">
                                🔒
                            </span>


                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={
                                    confirmPassword
                                }
                                onChange={(e) => {

                                    setConfirmPassword(
                                        e.target.value
                                    );

                                    setError("");
                                }}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />


                            <button
                                type="button"
                                className="signup-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >

                                {showConfirmPassword
                                    ? "◉"
                                    : "◌"}

                            </button>

                        </div>

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="signup-error">
                            {error}
                        </div>

                    )}


                    {/* Signup */}

                    <button
                        type="submit"
                        className="signup-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating account..."
                            : "Create account"}

                    </button>

                </form>


                {/* Login */}

                <p className="signup-login-text">

                    Already have an account?

                    <button
                        type="button"
                        className="signup-login-button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Log in
                    </button>

                </p>

            </div>

        </div>
    );
}


export default Signup;
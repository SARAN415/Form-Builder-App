import React, {
    useEffect,
    useState
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "./AuthSession";

import "../Style/Auth.css";


function OTPVerification() {

    const navigate =
        useNavigate();

    const location =
        useLocation();


    const {
        login, checkAuthentication
    } = useAuth();


    const email =
        location.state?.email || "";


    const [otp, setOtp] =
        useState("");

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [resending, setResending] =
        useState(false);

    const [countdown, setCountdown] =
        useState(60);


    useEffect(() => {

        if (!email) {

            navigate(
                "/login",
                {
                    replace: true
                }
            );
        }

    }, [
        email,
        navigate
    ]);


    useEffect(() => {

        if (countdown <= 0) {

            return;
        }


        const timer =
            setInterval(() => {

                setCountdown(
                    previous =>
                        previous - 1
                );

            }, 1000);


        return () => {

            clearInterval(timer);

        };

    }, [
        countdown
    ]);


    const handleOtpChange = (e) => {

        const value =
            e.target.value;


        // Numbers only

        if (!/^\d*$/.test(value)) {

            return;
        }


        // Maximum 6 digits

        if (value.length > 6) {

            return;
        }


        setOtp(value);

        setError("");

        setSuccess("");
    };


    const handleVerifyOtp = async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");


        if (!otp) {

            setError(
                "Please enter the OTP."
            );

            return;
        }


        if (otp.length !== 6) {

            setError(
                "OTP must contain 6 digits."
            );

            return;
        }


        setLoading(true);


        try {

            const response =
                await fetch(
                    "http://localhost:8080/auth/verify-otp",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email:
                                email,

                            otp:
                                otp

                        })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                setError(
                    result.message ||
                    "Invalid or expired OTP."
                );

                return;
            }


            if (!result.accessToken) {

                setError(
                    "Authentication token was not received."
                );

                return;
            }


            login(
                result.accessToken,
                result.user
            );

            await checkAuthentication();


            navigate(
                "/",
                {
                    replace: true
                }
            );


        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );


            setError(
                "Unable to connect to the server."
            );

        } finally {

            setLoading(false);
        }
    };


    const handleResendOtp = async () => {

        if (countdown > 0) {

            return;
        }


        setError("");

        setSuccess("");

        setResending(true);


        try {

            const response =
                await fetch(
                    "http://localhost:8080/auth/resend-otp",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email:
                                email

                        })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                setError(
                    result.message ||
                    "Unable to resend OTP."
                );

                return;
            }


            setSuccess(
                "A new OTP has been sent to your email."
            );


            setOtp("");

            setCountdown(60);


        } catch (error) {

            console.error(
                "Resend OTP error:",
                error
            );


            setError(
                "Unable to connect to the server."
            );

        } finally {

            setResending(false);
        }
    };


    const handleBackToLogin = () => {

        navigate(
            "/login",
            {
                replace: true
            }
        );
    };


    return (

        <div className="otp-page">

            <div className="otp-card">

                <div className="otp-brand">

                    <div className="otp-brand-logo">
                        ◇
                    </div>

                    <span>
                        FormBuilder
                    </span>

                </div>

                <h1>
                    Verify your email
                </h1>


                <p className="otp-subtitle">

                    We've sent a 6-digit
                    verification code to

                    <strong>
                        {" "}
                        {email}
                    </strong>

                </p>

                <form
                    onSubmit={
                        handleVerifyOtp
                    }
                >


                    <div className="otp-form-group">

                        <label>
                            Enter OTP
                        </label>


                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otp}
                            onChange={
                                handleOtpChange
                            }
                            placeholder="000000"
                            className="otp-input"
                            autoFocus
                        />

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="otp-error">
                            {error}
                        </div>

                    )}


                    {/* Success */}

                    {success && (

                        <div className="otp-success">
                            {success}
                        </div>

                    )}


                    {/* Verify */}

                    <button
                        type="submit"
                        className="otp-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Verifying..."
                            : "Verify OTP"}

                    </button>

                </form>


                <div className="otp-resend">

                    {countdown > 0 ? (

                        <p>

                            Resend OTP in{" "}

                            <strong>
                                {countdown}s
                            </strong>

                        </p>

                    ) : (

                        <button
                            type="button"
                            onClick={
                                handleResendOtp
                            }
                            disabled={resending}
                        >

                            {resending
                                ? "Sending..."
                                : "Resend OTP"}

                        </button>

                    )}

                </div>

                <button
                    type="button"
                    className="otp-back"
                    onClick={
                        handleBackToLogin
                    }
                >

                    ← Back to Login

                </button>

            </div>

        </div>
    );
}


export default OTPVerification;
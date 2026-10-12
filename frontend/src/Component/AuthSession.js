import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    useRef
} from "react";


// =====================================================
// Authentication Context
// =====================================================

const AuthContext = createContext(null);


// =====================================================
// JWT Helper Functions
// =====================================================

function decodeJwtPayload(token) {

    try {

        const parts =
            token.split(".");


        // JWT must contain:
        // header.payload.signature

        if (parts.length !== 3) {

            return null;
        }


        const base64Payload =
            parts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");


        const payload =
            atob(base64Payload);


        return JSON.parse(payload);

    } catch (error) {

        console.error(
            "Unable to decode JWT:",
            error
        );

        return null;
    }
}


// =====================================================
// Check JWT locally
// =====================================================

function isJwtLocallyValid(token) {

    if (!token) {

        return false;
    }


    const payload =
        decodeJwtPayload(token);


    if (!payload) {

        return false;
    }


    // JWT must have expiry

    if (!payload.exp) {

        return false;
    }


    // Current time in seconds

    const currentTime =
        Math.floor(
            Date.now() / 1000
        );


    // Token expired

    if (
        payload.exp <= currentTime
    ) {

        return false;
    }


    return true;
}


// =====================================================
// Auth Provider
// =====================================================

export function AuthProvider({
    children
}) {

    // -----------------------------------------------
    // Authentication status
    // -----------------------------------------------

    const [status, setStatus] =
        useState("booting");


    // -----------------------------------------------
    // Current user
    // -----------------------------------------------

    const [user, setUser] =
        useState(null);


    // =================================================
    // Check Authentication
    // =================================================

    const checkAuthentication =
        useCallback(
            async () => {

                // -------------------------------------
                // Get JWT
                // -------------------------------------

                const token =
                    localStorage.getItem(
                        "accessToken"
                    );

                console.log(
                    "Checking authentication with token:",
                    token
                );


                // -------------------------------------
                // No token
                // -------------------------------------

                if (!token) {

                    setUser(null);

                    setStatus(
                        "anonymous"
                    );

                    return;
                }


                // -------------------------------------
                // Check JWT locally
                // -------------------------------------

                const valid =
                    isJwtLocallyValid(
                        token
                    );

                console.log(
                    "JWT locally valid:",
                    valid
                );


                if (!valid) {

                    localStorage.removeItem(
                        "accessToken"
                    );

                    setUser(null);

                    setStatus(
                        "anonymous"
                    );

                    return;
                }


                // -------------------------------------
                // Verify JWT with backend
                // -------------------------------------

                try {

                    const response =
                        await fetch(
                            "http://localhost:8080/auth/me",
                            {
                                method: "GET",

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    // ---------------------------------
                    // Backend rejected token
                    // ---------------------------------

                    if (!response.ok) {

                        console.log(
                            "Authentication check failed with status:",
                            response.status
                        );

                        localStorage.removeItem(
                            "accessToken"
                        );

                        setUser(null);

                        setStatus(
                            "anonymous"
                        );

                        return;
                    }


                    // ---------------------------------
                    // Backend accepted token
                    // ---------------------------------

                    const userData =
                        await response.json();

                    console.log(
                        "Authentication check successful. User data:",
                        userData
                    );


                    setUser(
                        userData
                    );

                    setStatus(
                        "authenticated"
                    );

                } catch (error) {

                    console.error(
                        "Authentication check failed:",
                        error
                    );


                    setUser(null);

                    setStatus(
                        "anonymous"
                    );
                }

            },
            []
        );


    // =================================================
    // Login
    // =================================================

    const login = (
        accessToken,
        userData
    ) => {

        // Store JWT

        localStorage.setItem(
            "accessToken",
            accessToken
        );


        // Store user

        setUser(
            userData
        );


        // Change status

        setStatus(
            "authenticated"
        );
    };

    // =================================================
    // Check authentication when application starts
    // =================================================

    useEffect(() => {

        checkAuthentication();

    }, [
        checkAuthentication
    ]);


    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

    function useAutoLogout(logout) {

        const timerRef = useRef(null);

        useEffect(() => {

            const resetTimer = () => {

                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }

                timerRef.current = setTimeout(() => {

                    console.log("User inactive for 15 minutes. Logging out.");

                    logout();

                }, INACTIVITY_LIMIT);
            };

            const events = [
                "mousemove",
                "mousedown",
                "keydown",
                "scroll",
                "touchstart",
                "click"
            ];

            events.forEach(event => {
                window.addEventListener(event, resetTimer);
            });

            // Start timer when user logs in / application loads
            resetTimer();

            return () => {

                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }

                events.forEach(event => {
                    window.removeEventListener(event, resetTimer);
                });
            };

        }, [logout]);
    }


    // =================================================
    // Logout
    // =================================================

    const logout = useCallback(async() => {

        // Remove JWT

        localStorage.removeItem(
            "accessToken"
        );


        // Clear user

        setUser(null);


        // Change status

        setStatus(
            "anonymous"
        );

        await checkAuthentication();
        
    }, [checkAuthentication]);

    useAutoLogout(logout);


    // =================================================
    // Context value
    // =================================================

    const contextValue = {

        // Current status

        status,


        // Convenient states

        booting:
            status === "booting",

        anonymous:
            status === "anonymous",

        authenticated:
            status === "authenticated",


        // Current user

        user,


        // Functions

        login,

        logout,

        checkAuthentication

    };


    // =================================================
    // Provider
    // =================================================

    return (

        <AuthContext.Provider
            value={
                contextValue
            }
        >

            {children}

        </AuthContext.Provider>
    );
}


// =====================================================
// useAuth Hook
// =====================================================

export function useAuth() {

    return useContext(
        AuthContext
    );
}
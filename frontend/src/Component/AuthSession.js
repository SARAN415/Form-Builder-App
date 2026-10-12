import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    useRef
} from "react";



const AuthContext = createContext(null);


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


export function AuthProvider({
    children
}) {

    const [status, setStatus] =
        useState("booting");


    const [user, setUser] =
        useState(null);


    const checkAuthentication =
        useCallback(
            async () => {

                const token =
                    localStorage.getItem(
                        "accessToken"
                    );

                console.log(
                    "Checking authentication with token:",
                    token
                );

                if (!token) {

                    setUser(null);

                    setStatus(
                        "anonymous"
                    );

                    return;
                }

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


export function useAuth() {

    return useContext(
        AuthContext
    );
}
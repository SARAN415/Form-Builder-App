import React,{useState} from "react";
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";
import PublicForm from "./Component/PublicForm";
import CustomAlert from './Component/CustomAlert';
import FormBuilder from "./Component/FormBuilder";
import Login from "./Component/Login";
import Signup from "./Component/Signup";
import OTPVerification from "./Component/OTPVerification";
import {AuthProvider} from "./Component/AuthSession";

export default function App() {

    const [alert, setAlert] = useState({
        show: false,
        type: "info",
        title: "",
        message: ""
    });
    
    const showAlert = (
        type,
        title,
        message,
    ) => {
    
        setAlert({
            show: true,
            type,
            title,
            message
        });
    
    };

    const closeAlert = () => {

        setAlert(prev => ({
            ...prev,
            show: false
        }));

    };

    return (
        <div>
            
            <BrowserRouter>
                <AuthProvider>
                <Routes>

                    <Route
                        path="/login"
                        element={
                            <Login />
                        }
                    />

                    <Route
                        path="/signup"
                        element={
                            <Signup />
                        }
                    />

                    <Route
                        path="/otp-verification"
                        element={
                            <OTPVerification />
                        }
                    />

                    <Route
                        path="/"
                        element={<FormBuilder />}
                    />

                    <Route
                        path="/public-form/:token"
                        element={<PublicForm showAlert={showAlert}/>}
                    />

                </Routes>
                </AuthProvider>

            </BrowserRouter>
            
            
            <div>
                <CustomAlert
                    show={alert.show}
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={closeAlert}
                />
            </div>
        </div>
        

    );

}
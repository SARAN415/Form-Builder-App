import React from "react";
import "../Style/CustomAlert.css";

function CustomAlert({
    show,
    type = "info",
    title,
    message,
    onClose
}) {

    if (!show) {
        return null;
    }


    const icons = {
        success: "✓",
        error: "!",
        warning: "!",
        info: "i"
    };


    return (
        <div className="alert-overlay">

            <div
                className={`custom-alert ${type}`}
            >

                {/* Icon */}

                <div className="alert-icon">
                    {icons[type]}
                </div>


                {/* Content */}

                <div className="alert-content">

                    <div className="alert-title">
                        {title}
                    </div>

                    <div className="alert-message">
                        {message}
                    </div>

                </div>


                {/* Close */}

                <button
                    className="alert-close"
                    onClick={onClose}
                >
                    ×
                </button>

            </div>

        </div>
    );
}

export default CustomAlert;
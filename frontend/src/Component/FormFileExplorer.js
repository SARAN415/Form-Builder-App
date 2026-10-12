import React, { useEffect, useState } from "react";
import "../Style/FormFileExplorer.css";

const FormFileExplorer = ({
    //onOpenForm,
    onClose
}) => {
    const [forms, setForms] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const loadForms = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("accessToken");

            const response = await fetch(
                "http://localhost:8080/api/forms",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? {
                                  Authorization:
                                      `Bearer ${token}`
                              }
                            : {})
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load forms"
                );
            }

            const data = await response.json();

            setForms(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {
            console.error(
                "FORM FILE EXPLORER ERROR:",
                err
            );

            setError(
                err.message ||
                    "Unable to load forms"
            );

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadForms();
    }, []);


    const filteredForms = forms.filter(
        (form) => {

            const name =
                form.name ||
                form.title ||
                `Form ${form.id}`;

            return name
                .toLowerCase()
                .includes(
                    searchText.toLowerCase()
                );
        }
    );


    const formatDate = (value) => {

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-GB"
        );
    };

    const copyLink = async (formId) => {

        try {

            const token =
                localStorage.getItem("accessToken");

            const response = await fetch(
                `http://localhost:8080/api/forms/${formId}/copy-link`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {

                throw new Error(
                    "Link file not found"
                );
            }

            const data =
                await response.json();

            await navigator.clipboard.writeText(
                data.link
            );

            alert(
                "Form link copied!"
            );

        } catch (error) {

            console.error(
                "COPY LINK ERROR:",
                error
            );

            alert(
                "Public form link not found. Please generate the form link first."
            );
        }
    };

    return (
        <div className="form-file-explorer">

            {/* HEADER */}

            <div className="form-explorer-header">

                <div className="form-header-left">

                    <span className="form-folder-icon">
                        📁
                    </span>

                    <span className="form-header-title">
                        Forms
                    </span>

                </div>


                <div className="form-header-right">

                    <button
                        className="form-refresh-button"
                        onClick={loadForms}
                        title="Refresh"
                    >
                        ↻
                    </button>

                    {onClose && (
                        <button
                            className="form-close-button"
                            onClick={onClose}
                            title="Close"
                        >
                            ×
                        </button>
                    )}

                </div>

            </div>


            <div className="form-breadcrumb">
                Database / Forms
            </div>


            <div className="form-search-row">

                <div className="form-search-box">

                    <span className="form-search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search forms..."
                        value={searchText}
                        onChange={(e) =>
                            setSearchText(
                                e.target.value
                            )
                        }
                    />

                </div>


                <span className="form-count">

                    {filteredForms.length}{" "}

                    {filteredForms.length === 1
                        ? "form"
                        : "forms"}

                </span>

            </div>


            <div className="form-list-container">


                <div className="form-list-header">

                    <div className="form-name-column">
                        Name
                    </div>

                    <div className="form-id-column">
                        ID
                    </div>

                    <div className="form-created-column">
                        Created
                    </div>

                    <div className="form-updated-column">
                        Updated
                    </div>
                    <div className="form-status-column">
                        Status
                    </div>

                    <div className="form-action-column">
                        Action
                    </div>

                </div>


                {loading && (
                    <div className="form-status">
                        Loading forms...
                    </div>
                )}


                {!loading && error && (
                    <div className="form-status">

                        <div>
                            {error}
                        </div>

                        <button
                            className="form-retry-button"
                            onClick={loadForms}
                        >
                            Retry
                        </button>

                    </div>
                )}


                {!loading &&
                    !error &&
                    filteredForms.length === 0 && (

                        <div className="form-status">

                            {searchText
                                ? "No matching forms found."
                                : "No forms available."}

                        </div>
                    )}


                {!loading &&
                    !error &&
                    filteredForms.map(
                        (form) => {

                            const formName =
                                form.name ||
                                form.title ||
                                `Form ${form.id}`;

                            return (
                                <div
                                    key={form.id}
                                    className="form-list-row"
                                    
                                >

                                    <div className="form-name-column">

                                        <span className="form-file-icon">
                                            📄
                                        </span>

                                        <span className="form-name">
                                            {formName}
                                        </span>

                                    </div>

                                    <div className="form-id-column">
                                        {form.id}
                                    </div>

                                    <div className="form-updated-column">
                                        {formatDate(
                                            form.createdAt
                                        )}
                                    </div>

                                    <div className="form-action-column">

                                        <button
                                            className="form-copy-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyLink(form.id);
                                            }}
                                        >
                                            Copy Link
                                        </button>

                                    </div>

                                </div>
                            );
                        }
                    )}

            </div>

        </div>
    );
};

export default FormFileExplorer;
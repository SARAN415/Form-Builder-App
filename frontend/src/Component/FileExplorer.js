import React, {
    useEffect,
    useState
} from "react";

import "../Style/FileExplorer.css";


function FileExplorer({
    onClose
}) {

    const [files, setFiles] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [expandedForms, setExpandedForms] =
        useState({});

    const [expandedResponses, setExpandedResponses] =
        useState({});



    useEffect(() => {

         const token =
                localStorage.getItem("accessToken");

        fetch(
            "http://localhost:8080/api/forms/files",
            {
                    method: "GET",
                    headers: {
                        ...(token
                            ? {
                                  Authorization:
                                      `Bearer ${token}`
                              }
                            : {})
                    }
                }
        )

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "Failed to load files"
                    );
                }

                return response.json();
            })

            .then(data => {

                setFiles(
                    Array.isArray(data)
                        ? data
                        : []
                );

                setError("");

            })

            .catch(error => {

                console.error(
                    "FILE EXPLORER ERROR:",
                    error
                );

                setError(
                    "Failed to load files"
                );

            })

            .finally(() => {

                setLoading(false);

            });

    }, []);



    const groupedFiles = files.reduce(
    (forms, file) => {


        if (!forms[file.formId]) {

            forms[file.formId] = {};
        }


        if (
            !forms[file.formId][
                file.responseId
            ]
        ) {

            forms[file.formId][
                file.responseId
            ] = [];
        }


        if (!forms[file.formId]) {
            forms[file.formId] = {};
        }

        if (!forms[file.formId][file.responseId]) {
            forms[file.formId][file.responseId] = [];
        }

        const files =
            forms[file.formId][file.responseId];

        if (
            !files.some(
                existingFile =>
                    existingFile.fileId === file.fileId
            )
        ) {
            files.push(file);
        }


        return forms;

    },
    {}
);

    const toggleFolder = (
        formId
    ) => {

        setExpandedForms(prev => ({

            ...prev,

            [formId]:
                !prev[formId]

        }));

    };

    const toggleResponse = (
    formId,
    responseId
) => {

    const key =
        `${formId}_${responseId}`;


    setExpandedResponses(prev => ({

        ...prev,

        [key]:
            !prev[key]

    }));
};


const openFile = async (fileId) => {

    try {

        const token =
            localStorage.getItem("accessToken");

        const response = await fetch(
            `http://localhost:8080/api/forms/files/${fileId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "OPEN FILE ERROR:",
                response.status,
                errorText
            );

            throw new Error(
                "Failed to open file"
            );
        }

        // Convert response to Blob
        const blob =
            await response.blob();

        // Create temporary browser URL
        const fileUrl =
            window.URL.createObjectURL(blob);

        // Open file
        window.open(
            fileUrl,
            "_blank"
        );

        // Release URL later
        setTimeout(() => {
            window.URL.revokeObjectURL(fileUrl);
        }, 60000);

    } catch (error) {

        console.error(
            "OPEN FILE ERROR:",
            error
        );

        alert("Unable to open file");
    }
};


    const getFileIcon = (
        contentType
    ) => {

        if (
            contentType?.startsWith(
                "image/"
            )
        ) {

            return "🖼️";
        }


        if (
            contentType ===
            "application/pdf"
        ) {

            return "📕";
        }


        if (
            contentType?.includes(
                "word"
            )
        ) {

            return "📘";
        }


        if (
            contentType?.includes(
                "excel"
            )
        ) {

            return "📗";
        }


        return "📄";
    };


    return (

        <div className="file-explorer">


            <div className="file-explorer-header">

                <span>
                    📁 File Explorer
                </span>


                <button
                    className="file-explorer-close"
                    onClick={onClose}
                >
                    ×
                </button>

            </div>


            <div className="file-explorer-body">


                {loading && (

                    <div className="file-explorer-message">

                        Loading...

                    </div>

                )}


                {!loading &&
                    error && (

                        <div className="file-explorer-error">

                            {error}

                        </div>

                    )}


                {!loading &&
                    !error &&
                    Object.keys(
                        groupedFiles
                    ).length === 0 && (

                        <div className="file-explorer-message">

                            No files found.

                        </div>

                    )}


                {!loading &&
                    !error &&

                    Object.entries(
                        groupedFiles
                    ).map(
                        ([formId, responses]) => (

                            <div
                                key={formId}
                                className="form-folder"
                            >


                                <div
                                    className="folder-item"
                                    onClick={() =>
                                        toggleFolder(formId)
                                    }
                                >

                                    <span className="folder-icon">

                                        {
                                            expandedForms[
                                                formId
                                            ]
                                                ? "📂"
                                                : "📁"
                                        }

                                    </span>


                                    <span className="folder-name">

                                        {formId}

                                    </span>

                                </div>


                                {expandedForms[
                                    formId
                                ] && (

                                    <div className="folder-files">

                                        {Object.entries(
                                            responses
                                        ).map(
                                            (
                                                [
                                                    responseId,
                                                    responseFiles
                                                ]
                                            ) => {

                                                const responseKey =
                                                    `${formId}_${responseId}`;


                                                return (

                                                    <div
                                                        key={
                                                            responseId
                                                        }
                                                    >


                                                        <div
                                                            className="folder-item response-folder"

                                                            onClick={() =>
                                                                toggleResponse(
                                                                    formId,
                                                                    responseId
                                                                )
                                                            }
                                                        >

                                                            <span
                                                                className="folder-icon"
                                                            >

                                                                {
                                                                    expandedResponses[
                                                                        responseKey
                                                                    ]
                                                                        ? "📂"
                                                                        : "📁"
                                                                }

                                                            </span>


                                                            <span
                                                                className="folder-name"
                                                            >

                                                                {responseId}

                                                            </span>

                                                        </div>


                                                        {
                                                            expandedResponses[
                                                                responseKey
                                                            ] && (

                                                                <div className="response-files">

                                                                    {
                                                                        responseFiles.map(
                                                                            file => (

                                                                                <div
                                                                                    key={
                                                                                        file.fileId
                                                                                    }

                                                                                    className="file-item"

                                                                                    onDoubleClick={() =>
                                                                                        openFile(
                                                                                            file.fileId
                                                                                        )
                                                                                    }
                                                                                >

                                                                                    <span className="file-icon">

                                                                                        {
                                                                                            getFileIcon(
                                                                                                file.contentType
                                                                                            )
                                                                                        }

                                                                                    </span>


                                                                                    <div className="file-details">

                                                                                        <div className="file-name">

                                                                                            {
                                                                                                file.fileName
                                                                                            }

                                                                                        </div>


                                                                                        <div className="file-label">

                                                                                            Field:
                                                                                            {" "}
                                                                                            {
                                                                                                file.label
                                                                                            }

                                                                                        </div>

                                                                                    </div>

                                                                                </div>

                                                                            )
                                                                        )
                                                                    }

                                                                </div>

                                                            )
                                                        }

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                )}

                            </div>

                        )
                    )
                }

            </div>

        </div>
    );
}

export default FileExplorer;
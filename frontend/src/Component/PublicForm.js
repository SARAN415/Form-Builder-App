import React, { useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import "../Style/PublicForm.css";
import EmbedFormModal from "./EmbedFormModel";

function PublicForm(
    {showAlert}
) {

    const { token } = useParams();

    const [form, setForm] = useState(null);
    const [parsedFormData, setParsedFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [values, setValues] = useState({});
    const [files, setFiles] = useState({});

    useEffect(() => {

    const loadPublicForm = async () => {

        try {
            const jwttoken =
                localStorage.getItem("accessToken");

            const response = await fetch(
                `http://localhost:8080/api/public-forms/${token}`,
                {
                    headers: {
                        ...(jwttoken
                            ? {
                                  Authorization:
                                      `Bearer ${jwttoken}`
                              }
                            : {})
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Form not found");
            }

            const data = await response.json();

            console.log("Public form data:", data);

            // formData coming from backend is a JSON string
            const parsedFormData =
                typeof data.formData === "string"
                    ? JSON.parse(data.formData)
                    : data.formData;


            console.log(
                "Parsed form data:",
                parsedFormData
            );


            setParsedFormData(
                parsedFormData
            );

            setForm(data.token);

        } catch (error) {

            console.error(
                "Failed to load public form:",
                error
            );

            setError("Unable to load form");

        } finally {

            setLoading(false);
        }
    };

    if (token) {
        loadPublicForm();
    }

}, [token]);

    if (loading) {
        return (
            <div className="public-form-loading">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="public-form-error">
                {error}
            </div>
        );
    }

    // const copyCode = async () => {

    //     try {

    //         const publicFormUrl = new URL(
    //             window.location.href
    //         );

    //         const [componentResponse, styleResponse] = await Promise.all([
    //             fetch(new URL(
    //                 "/source/PublicForm.js?v=react-source",
    //                 publicFormUrl
    //             )),
    //             fetch(new URL(
    //                 "/source/PublicForm.css?v=react-source",
    //                 publicFormUrl
    //             ))
    //         ]);

    //         if (!componentResponse.ok || !styleResponse.ok) {
    //             throw new Error("Source files could not be loaded");
    //         }

    //         const componentCode = await componentResponse.text();
    //         const styleCode = await styleResponse.text();

    //         await navigator.clipboard.writeText(
    //             `${componentCode}\n\n/* PublicForm.css */\n${styleCode}`
    //         );

    //         showAlert(
    //             "success",
    //             "Copied",
    //             "PublicForm.js and PublicForm.css copied to the clipboard"
    //         );

    //     } catch (error) {

    //         console.error("COPY FORM CODE ERROR:", error);

    //         showAlert(
    //             "error",
    //             "Error",
    //             "Unable to load the current React source files. Restart the development server and try again."
    //         );
    //     }
    // };

    // const parsedFormData =
    //     JSON.parse(
    //         decodeURIComponent(
    //             formData
    //         )
    //     );
    
    // const container = parsedFormData.container;

    // const controls = Array.isArray(
    //     parsedFormData.controls
    // )
    //     ? parsedFormData.controls
    //     : [];
    if (loading) {
    return <div>Loading form...</div>;
}

if (error) {
    return <div>{error}</div>;
}

if (!parsedFormData) {
    return <div>Form not found</div>;
}

const container = parsedFormData.container;

const controls = Array.isArray(parsedFormData.controls)
    ? parsedFormData.controls
    : [];

    const handleChange = (
        label,
        value
    ) => {

        setValues(prev => ({
            ...prev,
            [label]: value
        }));

        

    };

    const handleFileChange = (label, file) => {

        setFiles(prev => ({
            ...prev,
            [label]: file
        }));

    };


    const submitForm = async () => {

        console.log(
            "FORM VALUES:",
            values
        );

        try {
             const jwttoken = localStorage.getItem("accessToken");
             
             const formData = new FormData();

             formData.append(
                "answers",
                JSON.stringify(values)
            );

            Object.entries(files).forEach(
                ([label, file]) => {

                    formData.append(
                        "files",
                        file
                    );

                    formData.append(
                        "fileLabels",
                        label
                    );

                }
            );

            for (const item of controls) {

                // ==============================
                // Checkbox
                // ==============================

                if (item.type === "checkbox") {

                    const selected =
                        values[item.label] || [];


                    if (
                        item.required === true &&
                        selected.length === 0
                    ) {

                        showAlert(
                            "warning",
                            "Warning",
                            `${item.label} is required`
                        );

                        return;
                    }
                }
            }

            const response = await fetch(
                `http://localhost:8080/api/forms/${token}/responses`,
                {
                    method: "POST",

                    headers: {
                            ...(jwttoken
                                ? {
                                    Authorization: `Bearer ${jwttoken}`
                                }
                                : {})
                        },

                    body: formData
                }
            );


            if (!response.ok) {

                const errorMessage =
                    await response.text();

                throw new Error(
                    errorMessage ||
                    "Failed to submit form"
                );

            }


            const result =
                await response.text();


            console.log(
                "FORM RESPONSE:",
                result
            );


            showAlert(
                "success","Success","Form submitted successfully"
            );


            // Clear entered values
            setValues({});
            setFiles({});

            console.log("BMI Value:",Number(values["Weight"])/Number(values["Height"])**2);


        } catch (error) {

            console.error(
                "FORM SUBMISSION ERROR:",
                error
            );


            showAlert("error","Error","Failed to submit form");

        }

    };

    if (!container) {

        return (
            <div className="public-message">

                <h3>
                    Form container not found
                </h3>

                <p>
                    No container was returned
                    from the server.
                </p>

            </div>
        );

    }

    const containerLeft =
        container.x -
        container.width / 2;


    const containerTop =
        container.y -
        container.height / 2;


    return (

        <div className="public-form-page">

            {/* <button
                type="button"
                className="public-form-copy-button"
                onClick={copyCode}
            >
                Copy Code
            </button> */}
            <button
                type="button"
                className="public-form-copy-button"
                onClick={() => setShowEmbedModal(true)}
            >
                Embed Form
            </button>

            <div
                className="public-form-container"
                style={{

                    position: "relative",

                    width:
                        container.width,

                    height:
                        container.height,

                    border:
                        `${container.border || 1}px solid ${
                            container.borderColor ||
                            "black"
                        }`,

                    boxSizing:
                        "border-box",

                    backgroundColor:
                        "white"

                }}
            >


                {parsedFormData.controls.map(item => {

                    if (
                        item.containerId !==
                        container.id
                    ) {

                        return null;

                    }

                    const relativeX =
                        item.x -
                        containerLeft;


                    const relativeY =
                        item.y -
                        containerTop;


                    return (

                        <div
                            key={item.id}

                            className="public-control"

                            style={{

                                position:
                                    "absolute",

                                left:
                                    relativeX -
                                    item.width / 2,

                                top:
                                    relativeY -
                                    item.height / 2,

                                width:
                                    item.width,

                                height:
                                    item.height,

                                boxSizing:
                                    "border-box"

                            }}
                        >

                            {renderControl(
                                item,
                                values,
                                handleChange,
                                submitForm,
                                handleFileChange
                            )}

                        </div>

                    );

                })}

            </div>

            {showEmbedModal && (
                <EmbedFormModal
                    form={form}
                    onClose={() =>
                        setShowEmbedModal(false)
                    }
                />
            )}

        </div>

    );

}


function renderControl(
    item,
    values,
    handleChange,
    submitForm,
    handleFileChange
) {

    switch (item.input) {

        case "label":

            return (

                <label
                    style={{

                        display:
                            "block",

                        width:
                            item.width,

                        height:
                            item.height,

                        fontSize:
                            item.fontSize ||
                            16,

                        fontWeight:
                            item.fontWeight ||
                            "bold",

                        color:
                            item.color ||
                            "black"

                    }}
                >

                    {
                        item.label ||
                        "Label"
                    }

                </label>

            );

        case "input":
            if (item.type === "file") {

                return (
                    <input
                        type="file"

                        onChange={(e) => {

                            const file =
                                e.target.files?.[0];

                            if (file) {

                                handleFileChange(
                                    item.label,
                                    file
                                );

                            }

                        }}

                        required={
                            item.required || false
                        }

                        style={{
                            width: item.width,
                            height: item.height,

                            border:
                                `${item.border || 1}px solid ${
                                    item.borderColor ||
                                    "black"
                                }`,

                            boxSizing: "border-box",
                            padding: "6px"
                        }}
                    />
                );
            }

            if (item.type === "dropdown") {

                return (

                    <select

                        value={
                            values[item.label] ||
                            ""
                        }

                        onChange={(e) =>
                            handleChange(
                                item.label,
                                e.target.value
                            )
                        }

                        required={
                            item.required
                        }

                        style={{

                            width:
                                item.width,

                            height:
                                item.height,

                            border:
                                `${item.border || 1}px solid ${
                                    item.borderColor ||
                                    "black"
                                }`,

                            fontSize:
                                item.fontSize ||
                                14,

                            color:
                                item.color ||
                                "black",

                            boxSizing:
                                "border-box",

                            padding:
                                "6px 8px"

                        }}
                    >

                        <option value="">
                            -- Select --
                        </option>


                        {
                            Array.isArray(
                                item.options
                            ) &&
                            item.options.map(
                                (option, index) => (

                                    <option
                                        key={index}
                                        value={option}
                                    >
                                        {option}
                                    </option>

                                )
                            )
                        }

                    </select>

                );
            }

            if (item.type === "checkbox") {

                const selectedValues =
                    Array.isArray(
                        values[item.label]
                    )
                        ? values[item.label]
                        : [];


                return (

                    <div
                        style={{

                            width:
                                item.width,

                            height:
                                item.height,

                            border:
                                `${item.border || 1}px solid ${
                                    item.borderColor ||
                                    "black"
                                }`,

                            boxSizing:
                                "border-box",

                            padding:
                                "6px 8px",

                            overflow:
                                "auto"

                        }}
                    >

                        {
                            Array.isArray(
                                item.options
                            ) &&
                            item.options.map(
                                (option, index) => (

                                    <label
                                        key={index}

                                        style={{

                                            display:
                                                "block",

                                            marginBottom:
                                                "5px",

                                            fontSize:
                                                item.fontSize ||
                                                14,

                                            color:
                                                item.color ||
                                                "black"

                                        }}
                                    >

                                        <input

                                            type="checkbox"

                                            value={
                                                option
                                            }

                                            checked={
                                                selectedValues.includes(
                                                    option
                                                )
                                            }

                                            onChange={(
                                                e
                                            ) => {

                                                let newValues;


                                                if (
                                                    e.target
                                                        .checked
                                                ) {

                                                    newValues =
                                                        [
                                                            ...selectedValues,
                                                            option
                                                        ];

                                                } else {

                                                    newValues =
                                                        selectedValues
                                                            .filter(
                                                                value =>
                                                                    value !==
                                                                    option
                                                            );
                                                }


                                                handleChange(
                                                    item.label,
                                                    newValues
                                                );

                                            }}

                                            style={{
                                                marginRight:
                                                    "6px"
                                            }}

                                        />

                                        {
                                            option
                                        }

                                    </label>

                                )
                            )
                        }

                    </div>

                );
            }

            if (item.type === "radio") {

                return (

                    <div
                        style={{

                            width:
                                item.width,

                            height:
                                item.height,

                            border:
                                `${item.border || 1}px solid ${
                                    item.borderColor ||
                                    "black"
                                }`,

                            boxSizing:
                                "border-box",

                            padding:
                                "6px 8px",

                            overflow:
                                "auto"

                        }}
                    >

                        {
                            Array.isArray(
                                item.options
                            ) &&
                            item.options.map(
                                (option, index) => (

                                    <label
                                        key={index}

                                        style={{

                                            display:
                                                "block",

                                            marginBottom:
                                                "5px",

                                            fontSize:
                                                item.fontSize ||
                                                14,

                                            color:
                                                item.color ||
                                                "black"

                                        }}
                                    >

                                        <input

                                            type="radio"

                                            name={
                                                `radio-${item.id}`
                                            }

                                            value={
                                                option
                                            }

                                            required={
                                                item.required === true &&
                                                index === 0
                                            }

                                            checked={
                                                values[item.label] ===
                                                option
                                            }

                                            onChange={(e) =>
                                                handleChange(
                                                    item.label,
                                                    e.target.value
                                                )
                                            }

                                            style={{
                                                marginRight:
                                                    "6px"
                                            }}

                                        />

                                        {
                                            option
                                        }

                                    </label>

                                )
                            )
                        }

                    </div>

                );
            }

            return (

                <input
                    type={
                        item.type ||
                        "text"
                    }

                    placeholder={
                        item.placeholder ||
                        "Enter text"
                    }

                    value={
                        values[item.label] ||
                        ""
                    }

                    required={
                        item.required || false
                    }

                    readOnly={
                        item.readOnly || false
                    }

                    onChange={(e) =>
                        handleChange(
                            item.label,
                            e.target.value
                        )
                    }

                    style={{

                        width:
                            item.width,

                        height:
                            item.height,

                        border:
                            `${item.border || 1}px solid ${
                                item.borderColor ||
                                "black"
                            }`,

                        fontSize:
                            item.fontSize ||
                            14,

                        fontWeight:
                            item.fontWeight ||
                            "normal",

                        color:
                            item.color ||
                            "black",

                        padding:
                            "6px 8px",

                        boxSizing:
                            "border-box",

                        outline:
                            "none"

                    }}

                />

            );

        case "button":

            return (

                <button
                    type="button"

                    onClick={
                        submitForm
                    }

                    style={{

                        width:
                            item.width,

                        height:
                            item.height,

                        border:
                            `${item.border || 1}px solid ${
                                item.borderColor ||
                                "black"
                            }`,

                        fontSize:
                            item.fontSize ||
                            14,

                        fontWeight:
                            item.fontWeight ||
                            "normal",

                        color:
                            item.color ||
                            "black",

                        cursor:
                            "pointer",

                        boxSizing:
                            "border-box"

                    }}
                >

                    {
                        item.label ||
                        "Submit"
                    }

                </button>

            );


        default:

            return null;

    }

}


export default PublicForm;
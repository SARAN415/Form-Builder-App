import { useState,useRef,useEffect,useCallback } from "react";
import "../Style/FormBuilder.css";
import Toolbar from "./Toolbar";
import Playground from "./Playground";
import PropertyBox from "./PropertyBox";
import CustomAlert from './CustomAlert';
import html2canvas from "html2canvas";
import DatabaseDialogBox from "./DatabaseDialogBox";
import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "./AuthSession";
import FileExplorer from "./FileExplorer";
import FormFileExplorer from "./FormFileExplorer";
import AIChatbot from "./AIChatbot";

export default function FormBuilder() {

    const navigate =
    useNavigate();

    const {
        authenticated,
        booting
    } = useAuth();

    const [controls, setControls] = useState([]);

    const [selected, setSelected] = useState(null);

    const [zoom, setZoom] = useState(1);

    const [history, setHistory] = useState([]);

    const [redoHistory, setRedoHistory] = useState([]);

    const [clipboard, setClipboard] = useState([]);

    const playgroundRef = useRef(null);

    const exportRef = useRef(null);

    const [alert, setAlert] = useState({
        show: false,
        type: "info",
        title: "",
        message: ""
    });

    const [showDatabaseDialog, setShowDatabaseDialog] = useState(false);

    const [showFileExplorer, setShowFileExplorer] = useState(false);

    const [showFormFileExplorer, setShowFormFileExplorer] = useState(false);

    const [databaseConfig, setDatabaseConfig] =
        useState({
            url: "",
            driverClassName: "",
            username: "",
            password: ""
        });

    const [formInfo, setFormInfo]=useState([])

    const showAlert = useCallback(
        (
            type,
            title,
            message
        ) => {

            setAlert({
                show: true,
                type,
                title,
                message
            });

        },
        []
    );

    const closeAlert = () => {

        setAlert(prev => ({
            ...prev,
            show: false
        }));

    };

    const selectedRef = useRef([]);

    const updateSelection = (newSelection) => {

        selectedRef.current = newSelection;

        setSelected(newSelection);

    };

    const createAIId = () => {
        return Date.now() +
            Math.floor(Math.random() * 1000000);
    };

    const normalizeAIControl = (
        aiControl,
        id,
        containerId = null
    ) => {

        if (
            aiControl.input ===
            "form-container"
        ) {

            return {

                id,

                input:
                    "form-container",

                type:
                    aiControl.type ||
                    "text",

                label:
                    aiControl.label ||
                    "",

                width:
                    aiControl.width ??
                    530,

                height:
                    aiControl.height ??
                    530,

                border:
                    aiControl.border ??
                    2,

                borderColor:
                    aiControl.borderColor ||
                    "black",

                backgroundColor:
                    aiControl.backgroundColor ||
                    "white",

                x:
                    aiControl.x ??
                    300,

                y:
                    aiControl.y ??
                    300

            };

        }


        return {

            id,

            input:
                aiControl.input ||
                "input",

            type:
                aiControl.type ||
                (
                    aiControl.input ===
                    "button"
                        ? "button"
                        : "text"
                ),

            label:
                aiControl.label ||
                (
                    aiControl.input ===
                    "button"
                        ? "Submit"
                        : ""
                ),

            options:
                Array.isArray(
                    aiControl.options
                )
                    ? aiControl.options
                    : [],

            placeholder:
                aiControl.placeholder ||
                (
                    aiControl.input ===
                    "input"
                        ? "Enter text"
                        : ""
                ),

            width:
                aiControl.width ??
                200,

            height:
                aiControl.height ??
                40,

            border:
                aiControl.border ??
                2,

            borderColor:
                aiControl.borderColor ||
                "black",

            backgroundColor:
                aiControl.backgroundColor ||
                "white",

            required:
                aiControl.required ??
                false,

            readable:
                aiControl.readable ??
                false,

            x:
                aiControl.x ??
                100,

            y:
                aiControl.y ??
                100,

            containerId:
                containerId ??
                aiControl.containerId ??
                null

        };
    };

    const handleAIResult = useCallback(
        (aiResult) => {

            if (!aiResult) {
                return;
            }

            console.log(
                "========== AI RESULT =========="
            );

            console.log(
                aiResult
            );

            console.log(
                "================================"
            );


            const action =
                String(
                    aiResult.action || ""
                ).toUpperCase();

            const aiControls =
                Array.isArray(
                    aiResult.controls
                )
                    ? aiResult.controls
                    : [];


            if (action === "CREATE") {

                if (
                    aiControls.length ===
                    0
                ) {
                    return;
                }


                const oldControls =
                    structuredClone(
                        controls
                    );



                const containerControls =
                    aiControls.filter(
                        item =>
                            item.input ===
                            "form-container"
                    );


                const normalControls =
                    aiControls.filter(
                        item =>
                            item.input !==
                            "form-container"
                    );


                const createdContainers =
                    containerControls.map(
                        item => {

                            return normalizeAIControl(
                                item,
                                createAIId()
                            );

                        }
                    );


                const firstNewContainer =
                    createdContainers[0];


                const createdNormalControls =
                    normalControls.map(
                        (item, index) => {

                            let containerId =
                                item.containerId;


                            const existingContainer =
                                controls.find(
                                    control =>
                                        String(
                                            control.id
                                        ) ===
                                        String(
                                            containerId
                                        ) &&
                                        control.input ===
                                        "form-container"
                                );


                            if (
                                !existingContainer
                            ) {


                                if (
                                    createdContainers.length >
                                    0
                                ) {


                                    if (
                                        item.containerIndex !=
                                        null
                                    ) {

                                        const containerIndex =
                                            Number(
                                                item.containerIndex
                                            );

                                        containerId =
                                            createdContainers[
                                                Math.min(
                                                    containerIndex,
                                                    createdContainers.length - 1
                                                )
                                            ].id;

                                    } else {

                                        containerId =
                                            firstNewContainer.id;

                                    }

                                } else {

                                    const selectedContainer =
                                        selectedRef.current.find(
                                            item =>
                                                item.input ===
                                                "form-container"
                                        );

                                    containerId =
                                        selectedContainer
                                            ?.id ??
                                        null;
                                }

                            }


                            return normalizeAIControl(
                                item,
                                createAIId(),
                                containerId
                            );

                        }
                    );


                const allCreatedControls = [
                    ...createdContainers,
                    ...createdNormalControls
                ];


                const newControls = [
                    ...controls,
                    ...allCreatedControls
                ];


                console.log(
                    "AI NEW CONTROLS:",
                    allCreatedControls
                );


                setControls(
                    newControls
                );

                updateSelection(
                    allCreatedControls
                );


                saveHistory(
                    newControls,
                    oldControls
                );


                return;
            }


            if (action === "UPDATE") {

                if (
                    aiControls.length ===
                    0
                ) {
                    return;
                }


                const oldControls =
                    structuredClone(
                        controls
                    );


                const updatedControls =
                    controls.map(
                        control => {

                            const update =
                                aiControls.find(
                                    item =>
                                        String(
                                            item.id
                                        ) ===
                                        String(
                                            control.id
                                        )
                                );


                            if (!update) {

                                return control;

                            }


                            return {

                                ...control,

                                ...update,

                                id:
                                    control.id

                            };

                        }
                    );


                setControls(
                    updatedControls
                );


                const updatedSelected =
                    updatedControls.filter(
                        control =>
                            aiControls.some(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        control.id
                                    )
                            )
                    );


                if (
                    updatedSelected.length >
                    0
                ) {

                    updateSelection(
                        updatedSelected
                    );

                }


                saveHistory(
                    updatedControls,
                    oldControls
                );


                return;
            }


            if (action === "SELECT") {

                if (
                    aiResult.selectedId ==
                    null
                ) {

                    return;

                }


                const control =
                    controls.find(
                        item =>
                            String(
                                item.id
                            ) ===
                            String(
                                aiResult.selectedId
                            )
                    );


                if (!control) {

                    console.warn(
                        "AI requested unknown control ID:",
                        aiResult.selectedId
                    );

                    showAlert(
                        "info",
                        "Control Not Found",
                        `No control exists with ID ${aiResult.selectedId}.`
                    );

                    return;

                }


                updateSelection([
                    control
                ]);


                return;
            }


            console.warn(
                "Unknown AI action:",
                action
            );

        },

        [
            controls,
            showAlert
        ]
    );

    useEffect(() => {

        const handleAIControls = (
            event
        ) => {

            handleAIResult(
                event.detail
            );

        };


        window.addEventListener(
            "ai-controls",
            handleAIControls
        );


        return () => {

            window.removeEventListener(
                "ai-controls",
                handleAIControls
            );

        };

    }, [
        handleAIResult
    ]);

    useEffect(() => {

        const selectedId =
            selected &&
            selected.length > 0
                ? selected[0].id
                : null;


        window.dispatchEvent(
            new CustomEvent(
                "form-builder-state",
                {
                    detail: {

                        controls:
                            controls,

                        selectedId:
                            selectedId

                    }
                }
            )
        );

    }, [
        controls,
        selected
    ]);

    const saveHistory = (
        newControls,
        oldControls
    ) => {

        setHistory(prev => [
            ...prev,
            oldControls
        ]);

        setRedoHistory([]);

    };

    const executeIfAuthenticated = (
        action
    ) => {

        if (!authenticated) {

            return;
        }


        action();
    };

    const saveJSON = () => {

        const data = JSON.stringify(controls, null, 2);

        const blob = new Blob([data], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "form-design.json";

        link.click();

        URL.revokeObjectURL(url);
    };

    const importJSON = () => {

        const input = document.createElement("input");

        input.type = "file";
        input.accept = ".json,application/json";

        input.onchange = (event) => {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            const reader =
                new FileReader();

            reader.onload = (e) => {

                try {

                    const json =
                        JSON.parse(e.target.result);


                    let importedControls;


                    // If JSON itself is an array
                    if (Array.isArray(json)) {

                        importedControls = json;

                    }

                    else if (
                        Array.isArray(
                            json.controls
                        )
                    ) {

                        importedControls =
                            json.controls;

                    }

                    else {

                        showAlert("error","Error","Invalid JSON format");

                        return;
                    }

                    if (
                        importedControls.some(
                            item =>
                                !item.id ||
                                !item.input
                        )
                    ) {

                        showAlert("error","Error","Invalid controls found in JSON");

                        return;
                    }

                    const oldControls =
                        structuredClone(
                            controls
                        );

                    const idMap = new Map();


                    importedControls.forEach(item => {

                        const oldId =
                            item.id;

                        const newId =
                            Date.now() +
                            Math.random();

                        idMap.set(
                            oldId,
                            newId
                        );

                    });

                    const newControls =
                        importedControls.map(
                            item => {

                                const newItem = {

                                    ...item,

                                    id:
                                        idMap.get(
                                            item.id
                                        )

                                };


                                // Update containerId
                                // for child controls

                                if (
                                    item.containerId
                                ) {

                                    newItem.containerId =
                                        idMap.get(
                                            item.containerId
                                        );

                                }


                                return newItem;

                            }
                        );

                    setControls(
                        newControls
                    );

                    setSelected([]);

                    setRedoHistory([]);

                    setHistory(prev => [

                        ...prev,

                        oldControls

                    ]);

                    showAlert("success","Success","Form imported successfully");

                }

                catch (error) {

                    console.error(
                        "JSON import error:",
                        error
                    );

                    showAlert("error","Error","Invalid JSON file");

                }

            };


            reader.readAsText(file);

        };


        input.click();
    };

    const exportPNG = async () => {

        if (!playgroundRef.current) {

            console.error(
                "playgroundRef is null"
            );

            return;
        }

        try {

            const element =
                playgroundRef.current;

            // Save current transform
            const oldTransform =
                element.style.transform;


            // Remove zoom before export
            element.style.transform =
                "none";


            // Wait for browser to render
            await new Promise(resolve =>
                requestAnimationFrame(resolve)
            );


            const canvas =
                await html2canvas(
                    element,
                    {
                        backgroundColor: "#ffffff",

                        scale: 2,

                        useCORS: true,

                        logging: false
                    }
                );


            // Restore zoom
            element.style.transform =
                oldTransform;


            // Convert to PNG
            const image =
                canvas.toDataURL("image/png");


            // Download
            const link =
                document.createElement("a");

            link.download =
                "form.png";

            link.href =
                image;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);


        } catch (error) {

            console.error(
                "Export PNG failed:",
                error
            );

        }

    };

    const generateFormLink = async () => {


        if (!selected || selected.length === 0) {
            
            showAlert("info","Info","Please select a form container");
            return;
        }

        const selectedContainer =
            selected.find(
                item =>
                    item.input === "form-container"
            );


        if (!selectedContainer) {
            
            showAlert("info","Info","Please select a form container to generate the link");
            return;
        }

        const containerControls =
            controls.filter(item => {

                // Don't include the container itself here
                if (
                    item.input ===
                    "form-container"
                ) {
                    return false;
                }

                return (
                    item.containerId ===
                    selectedContainer.id
                );

            });

        const formData = {

            container: selectedContainer,

            controls: containerControls

        };

        setFormInfo(formData);

        setShowDatabaseDialog(true);

    };

    const saveDatabaseConfig = async () => {
    try {
        const token = localStorage.getItem("accessToken");

        // 1. Create the form in the backend
        const response = await fetch(
            "http://localhost:8080/api/forms",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    database: databaseConfig,
                    formData: JSON.stringify(formInfo)
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            console.error(
                "CREATE FORM ERROR:",
                response.status,
                errorText
            );

            showAlert(
                "error",
                "Error",
                "Failed to create form link"
            );

            return;
        }

        const data = await response.json();

        console.log("Form created:", data);


        // 2. Get the public token generated by backend
        const publicToken = data.publicToken;

        if (!publicToken) {
            console.error(
                "Public token is missing from backend response"
            );

            showAlert(
                "error",
                "Error",
                "Public form token was not generated"
            );

            return;
        }


        // 3. Generate the public form URL
        const link =
            `${window.location.origin}/public-form/${publicToken}`;


        console.log("Public form link:", link);


        // 4. Generate iframe code
        const iframeCode =
            `<iframe
                src="${link}"
                width="100%"
                height="600"
                style="border: none;"
                title="Public Form">
            </iframe>`;


        console.log("Iframe code:", iframeCode);


        // 5. Copy iframe code instead of exposing form source/config
        await navigator.clipboard.writeText(iframeCode);


        // 6. Save the generated public link in backend
        const responses = await fetch(
            `http://localhost:8080/api/forms/${data.id}/generate-link`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    link: link
                })
            }
        );


        if (!responses.ok) {
            console.error(
                "Unable to save form link:",
                responses.status
            );

            showAlert(
                "error",
                "Error",
                "Unable to save form link"
            );

            return;
        }


        // 7. Close dialog
        setShowDatabaseDialog(false);


        // 8. Show success message
        showAlert(
            "success",
            "Success",
            "Form embed code created and copied to the clipboard successfully"
        );


    } catch (error) {

        console.error(
            "GENERATE FORM LINK ERROR:",
            error
        );

        showAlert(
            "error",
            "Error",
            "Unable to generate form link"
        );
    }
};

    const closeDatabaseDialog = () => {
        setShowDatabaseDialog(false);
    };

    const databaseConnectionSuccess = () => {

        setShowDatabaseDialog(false);

        saveDatabaseConfig();
    };

    const copySelected = () => {

        if (!selected || selected.length === 0) {
            return;
        }

        const selectedIds =
            selected.map(item => item.id);

        const copiedControls =
            controls.filter(item =>
                selectedIds.includes(item.id)
            );

        // Deep copy
        setClipboard(
            structuredClone(copiedControls)
        );
    };


    const pasteSelected = () => {

    if (
        !clipboard ||
        clipboard.length === 0
    ) {
        return;
    }

    const oldControls =
        structuredClone(controls);


    // Create old ID → new ID mapping
    const idMap = new Map();


    clipboard.forEach(item => {

        idMap.set(
            item.id,
            Date.now() +
            Math.random()
        );

    });

    // Create pasted controls
    const pastedControls =
        clipboard.map(item => {

            const newItem = {

                ...structuredClone(item),

                id:
                    idMap.get(item.id),

                x:
                    (item.x || 0) + 20,

                y:
                    (item.y || 0) + 20

            };


            // Preserve container relationship
            if (item.containerId) {

                if (
                    idMap.has(
                        item.containerId
                    )
                ) {

                    newItem.containerId =
                        idMap.get(
                            item.containerId
                        );

                } else {

                    newItem.containerId =
                        item.containerId;

                }

            }


            return newItem;

        });


    const newControls = [

        ...controls,

        ...pastedControls

    ];


    // Update controls
    setControls(
        newControls
    );

    updateSelection(
        pastedControls
    );

    saveHistory(
        newControls,
        oldControls
    );

};

  return (

    <div className="container">

      {/* Toolbar */}

      <Toolbar
        executeIfAuthenticated={executeIfAuthenticated} 
        zoom={zoom} 
        selected={selected} 
        controls={controls} 
        setSelected={setSelected} 
        setControls={setControls} 
        setZoom={setZoom} 
        saveHistory={saveHistory} 
        history={history} 
        redoHistory={redoHistory} 
        setHistory={setHistory} 
        setRedoHistory={setRedoHistory} 
        saveJSON={saveJSON} 
        importJSON={importJSON} 
        exportPNG={exportPNG} 
        generateFormLink={generateFormLink} 
        copySelected={copySelected} 
        pasteSelected={pasteSelected}
        clipboard={clipboard}
        setShowFileExplorer={setShowFileExplorer}
        setShowFormFileExplorer={setShowFormFileExplorer}
      />

      <div className="main">

        {/* Playground */}

        <Playground
            booting={booting}
            authenticated={authenticated}
            navigate={navigate}
            showAlert={showAlert} 
            zoom={zoom} 
            controls={controls} 
            setControls={setControls} 
            selected={selected} 
            setSelected={setSelected} 
            playgroundRef={playgroundRef} 
            selectedRef={selectedRef} 
            updateSelection={updateSelection} 
            exportRef={exportRef} 
            saveHistory={saveHistory}
        />

        {/* Property Box */}
        <div className="right-panel">
            <PropertyBox 
                selected={selected} 
                setSelected={setSelected} 
                controls={controls} 
                setControls={setControls} 
                saveHistory={saveHistory}
            />
            <div className="ai-panel">

                <AIChatbot
                    mode="create"
                />

            </div>
        </div>

      </div>

      <CustomAlert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
      />

      {showDatabaseDialog && (

            <DatabaseDialogBox
                showAlert={showAlert}
                setShowDatabaseDialog={setShowDatabaseDialog}
                databaseConfig={databaseConfig} 
                setDatabaseConfig={setDatabaseConfig} 
                onClose={closeDatabaseDialog}
                onSuccess={databaseConnectionSuccess}
            />

        )}

        {showFileExplorer && (
            <FileExplorer
                onClose={() =>
                    setShowFileExplorer(false)
                }
            />
        )}

        {showFormFileExplorer && (
            <FormFileExplorer
                onClose={() => setShowFormFileExplorer(false)}
            />
        )}

    </div>

  );

}
import React,{useState} from 'react'
import '../Style/Toolbar.css'
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthSession";

function Toolbar({
    executeIfAuthenticated,
    zoom,
    selected,
    controls,
    setSelected,
    setControls,
    setZoom,
    saveHistory,
    history,
    redoHistory,
    setHistory,
    setRedoHistory,
    saveJSON,
    importJSON,
    exportPNG,
    generateFormLink,
    copySelected,
    pasteSelected,
    clipboard,
    setShowFileExplorer,
    setShowFormFileExplorer
}) {

    const { user, status, logout } = useAuth();
    const navigate = useNavigate();

    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const dragStartToolbar = (e, input) => {

        e.dataTransfer.setData(
            "input",
            input
        );

    };

    const deleteControl = () => {

    if (!selected || selected.length === 0) {
        return;
    }

    const oldControls =
        structuredClone(controls);

    const selectedIds =
        selected.map(item => item.id);


    const deletedContainerIds =
        selected
            .filter(
                item =>
                    item.input === "form-container"
            )
            .map(
                item => item.id
            );


    const newControls =
        controls.filter(item => {

            // Delete selected item
            if (
                selectedIds.includes(item.id)
            ) {
                return false;
            }

            // Delete controls belonging
            // to deleted containers
            if (
                item.containerId &&
                deletedContainerIds.includes(
                    item.containerId
                )
            ) {
                return false;
            }

            return true;

        });


    setControls(newControls);


    saveHistory(
        newControls,
        oldControls
    );


    setSelected([]);

};

    const clearAll = () => {

    if (controls.length === 0) {
        return;
    }

    const oldControls = structuredClone(controls);

    const newControls = [];

    setControls(newControls);

    saveHistory(
        newControls,
        oldControls
    );

    setSelected([]);

};

    const undo = () => {

        if (history.length === 0) return;

        const previous = history[history.length - 1];

        setRedoHistory(prev => [...prev, controls]);

        setHistory(prev => prev.slice(0, -1));

        setControls(previous);

    };

    const redo = () => {

        if (redoHistory.length === 0) return;

        const next = redoHistory[redoHistory.length - 1];

        setHistory(prev => [...prev, controls]);

        setRedoHistory(prev => prev.slice(0, -1));

        setControls(next);

    };

    const zoomIn = () => {

        setZoom(prev =>
            Math.min(
                prev + 0.1,
                2
            )
        );

    };

    const zoomOut = () => {

        setZoom(prev =>
            Math.max(
                prev - 0.1,
                0.5
            )
        );

    };

    return (
    <div className="top-toolbar">

            <div className="toolbar-brand">
                <div className="brand-icon">
                    F
                </div>

                <span>
                    Form Builder
                </span>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">

                <div className="toolbar-group-title">
                    FORM
                </div>

                <div
                    className="toolbar-item"
                    draggable
                    onDragStart={(e) =>
                        executeIfAuthenticated(() =>
                            dragStartToolbar(
                                e,
                                "form-container"
                            )
                        )
                    }
                >
                    <span className="toolbar-icon">
                        ▣
                    </span>

                    <span>
                        Container
                    </span>
                </div>

            </div>


            <div className="toolbar-divider" />

            <div className="toolbar-group">

                <div className="toolbar-group-title">
                    INPUTS
                </div>

                <div
                    className="toolbar-item"
                    draggable
                    onDragStart={(e) =>
                        executeIfAuthenticated(()=>
                            dragStartToolbar(
                                e,
                                "label"
                            )
                        )
                    }
                >
                    <span className="toolbar-icon">
                        T
                    </span>

                    <span>
                        Label
                    </span>
                </div>


                <div
                    className="toolbar-item"
                    draggable
                    onDragStart={(e) =>
                        executeIfAuthenticated(()=>
                            dragStartToolbar(
                                e,
                                "input"
                            )
                        )
                    }
                >
                    <span className="toolbar-icon">
                        ▭
                    </span>

                    <span>
                        Input
                    </span>
                </div>


                <div
                    className="toolbar-item"
                    draggable
                    onDragStart={(e) =>
                        executeIfAuthenticated(()=>
                            dragStartToolbar(
                                e,
                                "button"
                            )
                        )
                    }
                >
                    <span className="toolbar-icon">
                        ▣
                    </span>

                    <span>
                        Button
                    </span>
                </div>

            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">

                <div className="toolbar-group-title">
                    CLIPBOARD
                </div>

                <button
                    className="toolbar-button"
                    disabled={!selected || selected.length === 0}
                    onClick={copySelected}
                    title="Copy selected"
                >
                    Copy
                </button>

                <button
                    className="toolbar-button"
                    disabled={clipboard.length === 0}
                    onClick={pasteSelected}
                    title="Paste copied"
                >
                    Paste
                </button>

            </div>


            <div className="toolbar-divider" />

            <div className="toolbar-group">

                <div className="toolbar-group-title">
                    EDIT
                </div>

                <button
                    className="toolbar-action"
                    disabled={history.length === 0}
                    onClick={()=>executeIfAuthenticated(()=>undo)}
                    title="Undo"
                >
                    ↶
                </button>

                <button
                    className="toolbar-action"
                    disabled={redoHistory.length === 0}
                    onClick={redo}
                    title="Redo"
                >
                    ↷
                </button>

                <button
                    className="toolbar-action delete-action"
                    disabled={!selected || selected.length === 0}
                    onClick={deleteControl}
                    title="Delete selected"
                >
                    🗑
                </button>

                <button
                    className="toolbar-action"
                    disabled={controls.length === 0}
                    onClick={clearAll}
                    title="Clear all"
                >
                    ✕
                </button>

            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">

                <div className="toolbar-group-title">
                    ZOOM
                </div>

                <button
                    className="toolbar-action zoom-button"
                    disabled={zoom < 0.6 || controls.length === 0}
                    onClick={zoomOut}
                    title="Zoom out"
                >
                    −
                </button>

                <span className="zoom-value">
                    {Math.round(zoom * 100)}%
                </span>

                <button
                    className="toolbar-action zoom-button"
                    disabled={zoom >= 2 || controls.length === 0}
                    onClick={zoomIn}
                    title="Zoom in"
                >
                    +
                </button>

            </div>


            <div className="toolbar-divider" />

            <div className="toolbar-group">

                <div className="toolbar-group-title">
                    FILE
                </div>

                <button
                    className="toolbar-button"
                    onClick={() => executeIfAuthenticated(importJSON)}
                >
                    ↑ Import
                </button>

                <button
                    className="toolbar-button"
                    disabled={controls.length === 0}
                    onClick={saveJSON}
                >
                    ↓ Save
                </button>

                <button
                    className="toolbar-button"
                    disabled={controls.length === 0}
                    onClick={exportPNG}
                >
                    PNG
                </button>

            </div>

            <div className="toolbar-spacer" />

            {selected &&
            selected.some(
                item =>
                    item.input ===
                    "form-container"
            ) && (

                <button
                    className="generate-button"
                    onClick={generateFormLink}
                >
                    🔗 Generate Form Link
                </button>

            )}

            {status === "authenticated" && user && (

    <div className="profile-menu-container">

        <button
            className="profile-menu-button"
            onClick={() =>
                setProfileMenuOpen(
                    !profileMenuOpen
                )
            }
        >

            <span className="profile-username">
                {user.username}
            </span>

            <span
                className={
                    profileMenuOpen
                        ? "dropdown-arrow open"
                        : "dropdown-arrow"
                }
            >
                ▾
            </span>

        </button>


        {profileMenuOpen && (

            <div className="profile-dropdown">

                <button
                    onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/profile");
                    }}
                >
                    <span>👤</span>
                    My Profile
                </button>


                <button
                    onClick={() => {
                        setShowFormFileExplorer(true)
                    }}
                >
                    <span>📁</span>
                    My Forms
                </button>


                <button
                    onClick={() => {
                        setShowFileExplorer(true)
                    }}
                >
                    <span>📊</span>
                    My Form Responses
                </button>


                <div className="dropdown-divider" />


                <button
                    className="logout-menu-item"
                    onClick={() => {

                        setProfileMenuOpen(false);

                        logout();

                        navigate("/", {
                            replace: true
                        });
                    }}
                >
                    <span>↪</span>
                    Logout
                </button>

            </div>

        )}

    </div>
)}

        </div>
  )
}

export default Toolbar
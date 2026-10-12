import React, { useState, useRef, useEffect } from "react";
import '../Style/Playground.css';
import { useAuth } from "./AuthSession";

function Playground({
    booting,
    authenticated,
    navigate,
    showAlert,
    controls,
    setControls,
    selected,
    setSelected,
    zoom,
    playgroundRef,
    selectedRef,
    updateSelection,
    exportRef,
    saveHistory
}) {

    const { status } = useAuth();

    const [values, setValues] = useState({});

    const [isDragging, setIsDragging] =
        useState(false);

    const [dragStart, setDragStart] =
        useState(null);

    const dragOriginalControlsRef =
        useRef(null);

    const dragChangedRef =
        useRef(false);

    useEffect(() => {

        if (status === "anonymous") {

            setControls([]);
            setSelected([]);
        }

    }, [status, setControls, setSelected]);

    const isSelected = (item) => {

        return selectedRef.current.some(
            selectedItem =>
                selectedItem.id === item.id
        );

    };

    const handleChange = (label, value) => {

        setValues(prev => ({
            ...prev,
            [label]: value
        }));

    };

    const handleSelect = (e, item) => {

        e.stopPropagation();

        const currentSelection =
            selectedRef.current;

        if (
            e.ctrlKey ||
            e.metaKey
        ) {

            const exists =
                currentSelection.some(
                    selectedItem =>
                        selectedItem.id === item.id
                );


            // Remove selected item
            if (exists) {

                const newSelection =
                    currentSelection.filter(
                        selectedItem =>
                            selectedItem.id !== item.id
                    );

                updateSelection(
                    newSelection
                );

                return;
            }


            // Add selected item
            updateSelection([
                ...currentSelection,
                item
            ]);

            return;
        }

        updateSelection([
            item
        ]);

    };

    const handleMouseDown = (e, item) => {

        e.stopPropagation();

        const currentSelection =
            selectedRef.current;

        const alreadySelected =
            currentSelection.some(
                selectedItem =>
                    selectedItem.id === item.id
            );

        if (!alreadySelected) {

            return;

        }

        dragOriginalControlsRef.current =
            structuredClone(controls);


        dragChangedRef.current =
            false;

        setDragStart({

            mouseX:
                e.clientX,

            mouseY:
                e.clientY,

            items:
                currentSelection.map(
                    selectedItem => ({

                        id:
                            selectedItem.id,

                        x:
                            selectedItem.x,

                        y:
                            selectedItem.y

                    })
                )

        });


        setIsDragging(true);

    };

    const handleMouseMove = (e) => {

        if (
            !isDragging ||
            !dragStart
        ) {

            return;

        }

        const deltaX =
            (
                e.clientX -
                dragStart.mouseX
            ) / zoom;


        const deltaY =
            (
                e.clientY -
                dragStart.mouseY
            ) / zoom;


        if (
            deltaX !== 0 ||
            deltaY !== 0
        ) {

            dragChangedRef.current =
                true;

        }

        setControls(prevControls => {

            return prevControls.map(item => {

                const original =
                    dragStart.items.find(
                        dragItem =>
                            dragItem.id ===
                            item.id
                    );


                // Not selected
                if (!original) {

                    return item;

                }


                return {

                    ...item,

                    x:
                        original.x +
                        deltaX,

                    y:
                        original.y +
                        deltaY

                };

            });

        });

    };

    const handleMouseUp = () => {

        if (!isDragging) {

            return;

        }

        if (
            dragChangedRef.current &&
            dragOriginalControlsRef.current
        ) {

            const oldControls =
                dragOriginalControlsRef.current;

            saveHistory(
                controls,
                oldControls
            );

        }

        setIsDragging(false);

        setDragStart(null);

        dragOriginalControlsRef.current =
            null;

        dragChangedRef.current =
            false;

    };

    const allowDrop = (e) => {

        e.preventDefault();

    };


    const drop = (e) => {

        e.preventDefault();

        const rect =
            e.currentTarget
                .getBoundingClientRect();


        const x =
            (
                e.clientX -
                rect.left
            ) / zoom;


        const y =
            (
                e.clientY -
                rect.top
            ) / zoom;


        const input =
            e.dataTransfer.getData(
                "input"
            );


        if (!input) {

            return;

        }

        if (
            input === "form-container"
        ) {

            const newContainer = {

                id:
                    Date.now(),

                input:
                    "form-container",

                type:
                    "text",

                label:
                    "",

                width:
                    530,

                height:
                    530,

                border:
                    2,

                borderColor:
                    "black",

                x,
                y

            };


            // Save old state for undo
            const oldControls =
                structuredClone(
                    controls
                );


            setControls(prev => [

                ...prev,

                newContainer

            ]);


            // Select new container
            updateSelection([
                newContainer
            ]);


            // Save history
            saveHistory(
                [
                    ...controls,
                    newContainer
                ],
                oldControls
            );


            return;

        }

        const selectedContainer =
            selectedRef.current.find(
                item =>
                    item.input ===
                    "form-container"
            );

        if (!selectedContainer) {

            showAlert("info","Info","Please select a form container first");

            return;

        }

        const containerLeft =
            selectedContainer.x -
            selectedContainer.width / 2;


        const containerRight =
            selectedContainer.x +
            selectedContainer.width / 2;


        const containerTop =
            selectedContainer.y -
            selectedContainer.height / 2;


        const containerBottom =
            selectedContainer.y +
            selectedContainer.height / 2;

        if (
            x < containerLeft ||
            x > containerRight ||
            y < containerTop ||
            y > containerBottom
        ) {

            showAlert("info","Info","Drop the control inside the selected form container");

            return;

        }

        const newControl = {

            id:
                Date.now(),

            input:
                input,

            type:
                input === "input"
                    ? "text"
                    : input === "button"
                        ? "button"
                        : "text",

            label:
                input === "label"
                    ? "Label"
                    : input === "button"
                        ? "Submit"
                        : "",

            options:[],

            placeholder:
                input === "input"
                    ? "Enter text"
                    : "",

            width:
                200,

            height:
                40,

            border:
                2,

            borderColor:
                "black",
            
            required: false,

            readable: false,

            x,
            y,

            containerId:
                selectedContainer.id

        };

        const oldControls =
            structuredClone(
                controls
            );

        const newControls = [

            ...controls,

            newControl

        ];


        setControls(
            newControls
        );

        updateSelection([
            newControl
        ]);

        saveHistory(
            newControls,
            oldControls
        );

    };

    const renderControl = (item) => {

        if (
            item.input === "label"
        ) {

            return (

                <label

                    className={
                        isSelected(item)
                            ? "input-selected"
                            : "inputs"
                    }

                    style={{

                        width:
                            item.width,

                        height:
                            item.height,

                        fontSize:
                            item.fontSize ||
                            "16px",

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

        }

        if (
            item.input === "input"
        ) {

            if (item.type === "dropdown") {

                return (

                    <select
                        className={
                            isSelected(item)
                                ? "input-selected"
                                : "inputs"
                        }

                        value={
                            values[item.label] || ""
                        }

                        onChange={(e) =>
                            handleChange(
                                item.label,
                                e.target.value
                            )
                        }

                        style={{
                            width: item.width,
                            height: item.height,

                            border:
                                `${item.border || 1}px solid ${
                                    item.borderColor ||
                                    "black"
                                }`
                        }}
                    >

                        <option value="">
                            -- Select --
                        </option>

                        {item.options?.map(
                            (option, index) => (

                                <option
                                    key={index}
                                    value={option}
                                >
                                    {option}
                                </option>

                            )
                        )}

                    </select>

                );
            }

            if (item.type === "checkbox") {

                const selectedValues =
                    values[item.label] || [];

                return (

                    <div
                        className={
                            isSelected(item)
                                ? "input-selected"
                                : "inputs"
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
                            padding: "5px"
                        }}
                    >

                        {item.options?.map(
                            (option, index) => (

                                <label
                                    key={index}
                                    style={{
                                        display: "block"
                                    }}
                                >

                                    <input
                                        type="checkbox"

                                        value={option}

                                        checked={
                                            selectedValues.includes(
                                                option
                                            )
                                        }

                                        onChange={(e) => {

                                            let updatedValues;

                                            if (
                                                e.target.checked
                                            ) {

                                                updatedValues = [
                                                    ...selectedValues,
                                                    option
                                                ];

                                            } else {

                                                updatedValues =
                                                    selectedValues.filter(
                                                        value =>
                                                            value !==
                                                            option
                                                    );
                                            }

                                            handleChange(
                                                item.label,
                                                updatedValues
                                            );

                                        }}
                                    />

                                    {option}

                                </label>

                            )
                        )}

                    </div>

                );
            }

            if (item.type === "radio") {

                return (

                    <div
                        className={
                            isSelected(item)
                                ? "input-selected"
                                : "inputs"
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
                            padding: "5px"
                        }}
                    >

                        {item.options?.map(
                            (option, index) => (

                                <label
                                    key={index}
                                    style={{
                                        display: "block"
                                    }}
                                >

                                    <input
                                        type="radio"

                                        name={
                                            item.id
                                        }

                                        value={option}

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
                                    />

                                    {option}

                                </label>

                            )
                        )}

                    </div>

                );
            }

            return (

                    <input

                        className={
                            isSelected(item)
                                ? "input-selected"
                                : "inputs"
                        }

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
                                }`

                        }}

                    />

                );
        }

        if (
            item.input === "button"
        ) {

            return (

                <button

                    className={
                        isSelected(item)
                            ? "input-selected"
                            : "inputs"
                    }

                    type="button"

                    style={{

                        width:
                            item.width,

                        height:
                            item.height,

                        border:
                            `${item.border || 1}px solid ${
                                item.borderColor ||
                                "black"
                            }`

                    }}
                >

                    {
                        item.label ||
                        "Submit"
                    }

                </button>

            );

        }

        if (
            item.input ===
            "form-container"
        ) {

            return (

                <div

                    className={
                        isSelected(item)
                            ? "input-selected"
                            : "inputs"
                    }

                    style={{

                        position:
                            "absolute",

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
                            "border-box"

                    }}
                >

                    {
                        isSelected(item) && (

                            <>

                                <div
                                    className=
                                        "guide-vertical"
                                />

                                <div
                                    className=
                                        "guide-horizontal"
                                />

                            </>

                        )
                    }

                </div>

            );

        }


        return null;

    };

    return (

        <div

            className="playground"

            onDragOver={
                allowDrop
            }

            onDrop={
                drop
            }

            onMouseMove={
                handleMouseMove
            }

            onMouseUp={
                handleMouseUp
            }

            onMouseLeave={
                handleMouseUp
            }

            onClick={() =>
                updateSelection([])
            }

        >

              <div ref={exportRef} className="playground-export">
                <div

                ref={
                    playgroundRef
                }

                className=
                    "playground-content"

                style={{

                    transform:
                        `scale(${zoom})`,

                    transformOrigin:
                        "top left"

                }}

            >

                {
                    controls.map(item => (

                        <div

                            key={
                                item.id
                            }

                            className=
                                "control"

                            onMouseDown={
                                (e) =>
                                    handleMouseDown(
                                        e,
                                        item
                                    )
                            }

                            onClick={
                                (e) =>
                                    handleSelect(
                                        e,
                                        item
                                    )
                            }


                            style={{

                                position:
                                    "absolute",

                                width:
                                    item.width,

                                height:
                                    item.height,

                                left:
                                    item.x -
                                    item.width /
                                        2,

                                top:
                                    item.y -
                                    item.height /
                                        2,

                                cursor:
                                    isSelected(
                                        item
                                    )
                                        ? "move"
                                        : "pointer"

                            }}

                        >

                            {
                                renderControl(
                                    item
                                )
                            }

                            {
                                item.input !==
                                    "form-container" &&

                                item.containerId &&

                                <AlignmentGuides

                                    item={
                                        item
                                    }

                                    controls={
                                        controls
                                    }

                                />

                            }

                        </div>

                    ))

                }
                </div>

            </div>

            <div>
                {!booting && !authenticated ? (
                    <div className="login-overlay">

                        <div className="login-box">

                            <h2>
                                Login to continue
                            </h2>

                            <p>
                                Sign in to create and edit
                                your forms.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/login")
                                }
                            >
                                Login
                            </button>

                        </div>

                    </div>
                ) : null}
                            </div>

                        </div> 

                    )}

function AlignmentGuides({
    item,
    controls
}) {

    const container =
        controls.find(
            control =>
                control.id ===
                item.containerId
        );


    if (!container) {

        return null;

    }


    return (

        <div

            className=
                "alignment-guides"

            style={{

                width:
                    container.width,

                height:
                    container.height,

                left:

                    (
                        container.x -
                        container.width / 2
                    )

                    -

                    (
                        item.x -
                        item.width / 2
                    ),

                top:

                    (
                        container.y -
                        container.height / 2
                    )

                    -

                    (
                        item.y -
                        item.height / 2
                    )

            }}

        >

            <span

                className=
                    "guide-top"

                style={{

                    top:

                        (
                            item.y -
                            item.height / 2
                        )

                        -

                        (
                            container.y -
                            container.height / 2
                        )

                }}

            />

            <span

                className=
                    "guide-bottom"

                style={{

                    top:

                        (
                            item.y +
                            item.height / 2
                        )

                        -

                        (
                            container.y -
                            container.height / 2
                        )

                }}

            />

            <span

                className=
                    "guide-left"

                style={{

                    left:

                        (
                            item.x -
                            item.width / 2
                        )

                        -

                        (
                            container.x -
                            container.width / 2
                        )

                }}

            />

            <span

                className=
                    "guide-right"

                style={{

                    left:

                        (
                            item.x +
                            item.width / 2
                        )

                        -

                        (
                            container.x -
                            container.width / 2
                        )

                }}

            />

            <span
                className=
                    "guide-center"
            />

        </div>

    );

}


export default Playground;
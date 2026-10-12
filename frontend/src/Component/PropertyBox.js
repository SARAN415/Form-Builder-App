import React,{useState} from "react";
import "../Style/PropertyBox.css";

function PropertyBox({
    selected,
    setSelected,
    controls,
    setControls,
    saveHistory
}) {

    const [optionsText, setOptionsText] = useState("");

    const selectedItem =
    selected && selected.length > 0
        ? controls.find(
            item =>
                item.id ===
                selected[selected.length - 1].id
          )
        : null;


    const updateProperty = (property, value) => {

        const oldControls =
            structuredClone(controls);

        const newControls =
            controls.map(item => {

                if (item.id === selectedItem.id) {

                    return {
                        ...item,
                        [property]: value
                    };

                }

                return item;

            });

        setControls(newControls);

        // Update selected object reference
        setSelected(prev =>
            prev.map(item =>
                item.id === selectedItem.id
                    ? {
                        ...item,
                        [property]: value
                    }
                    : item
            )
        );

        if (saveHistory) {

            saveHistory(
                newControls,
                oldControls
            );

        }

    };

    const updateNumber = (
        property,
        value
    ) => {

        const numberValue = Number(value);

        if (Number.isNaN(numberValue)) {
            return;
        }

        updateProperty(
            property,
            numberValue
        );

    };

    if (!selectedItem) {

        return (
            <div className="property-panel">

                <div className="property-header">
                    <span>Properties</span>
                </div>

                <div className="property-empty">

                    <div className="empty-icon">
                        +
                    </div>

                    <div>
                        Select an element
                    </div>

                    <small>
                        Select a control to view
                        its properties
                    </small>

                </div>

            </div>
        );

    }


    return (

        <div className="property-panel">

            <div className="property-header">

                <div>
                    <span className="property-title">
                        Properties
                    </span>

                    <span className="property-type">
                        {selectedItem.input}
                    </span>
                </div>

            </div>

            <div className="property-section">

                <div className="section-title">
                    General
                </div>


                <div className="property-field">

                    <label>
                        Control
                    </label>

                    <input
                        className="property-control"
                        value={
                            selectedItem.input || ""
                        }
                        readOnly
                    />

                </div>


                <div className="property-field">

                    <label>
                        ID
                    </label>

                    <input
                        className="property-control"
                        value={
                            selectedItem.id
                        }
                        readOnly
                    />

                </div>

            </div>

            <div className="property-section">

                <div className="section-title">
                    Layout
                </div>

                <div className="field-group-title">
                    Position
                </div>

                <div className="two-column">

                    <div className="property-field">

                        <label>
                            X
                        </label>

                        <input
                            className="property-control"
                            type="number"
                            value={
                                selectedItem?.x ?? 0
                            }
                            onChange={(e) =>
                                updateNumber(
                                    "x",
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="property-field">

                        <label>
                            Y
                        </label>

                        <input
                            className="property-control"
                            type="number"
                            value={
                                selectedItem.y ?? 0
                            }
                            onChange={(e) =>
                                updateNumber(
                                    "y",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>

                <div className="field-group-title">
                    Size
                </div>

                <div className="two-column">

                    <div className="property-field">

                        <label>
                            Width
                        </label>

                        <input
                            className="property-control"
                            type="number"
                            value={
                                selectedItem.width ?? 0
                            }
                            onChange={(e) =>
                                updateNumber(
                                    "width",
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="property-field">

                        <label>
                            Height
                        </label>

                        <input
                            className="property-control"
                            type="number"
                            value={
                                selectedItem.height ?? 0
                            }
                            onChange={(e) =>
                                updateNumber(
                                    "height",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>

            </div>

            {
                (
                    selectedItem.input === "label" ||
                    selectedItem.input === "input" ||
                    selectedItem.input === "button"
                ) && (

                    <div className="property-section">

                        <div className="section-title">
                            Content
                        </div>


                        <div className="property-field">

                            <label>
                                Label
                            </label>

                            <input
                                className="property-control"
                                type="text"
                                value={
                                    selectedItem.label || ""
                                }
                                onChange={(e) =>
                                    updateProperty(
                                        "label",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {
                            selectedItem.input ===
                                "input" && (

                                <>

                                    <div className="property-field">

                                        <label>
                                            Placeholder
                                        </label>

                                        <input
                                            className="property-control"
                                            type="text"
                                            value={
                                                selectedItem.placeholder ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                updateProperty(
                                                    "placeholder",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                    <div className="property-field">

                                        <label>
                                            Required
                                        </label>

                                        <select
                                            className="property-control"
                                            value={
                                                selectedItem.required
                                                    ? "true"
                                                    : "false"
                                            }
                                            onChange={(e) =>
                                                updateProperty(
                                                    "required",
                                                    e.target.value === "true"
                                                )
                                            }
                                        >

                                            <option value="true">
                                                Yes
                                            </option>

                                            <option value="false">
                                                No
                                            </option>

                                        </select>

                                    </div>


                                    {/* Readable */}

                                    <div className="property-field">

                                        <label>
                                            Readable
                                        </label>

                                        <select
                                            className="property-control"
                                            value={
                                                selectedItem.readable !== false
                                                    ? "true"
                                                    : "false"
                                            }
                                            onChange={(e) =>
                                                updateProperty(
                                                    "readable",
                                                    e.target.value === "true"
                                                )
                                            }
                                        >

                                            <option value="true">
                                                Yes
                                            </option>

                                            <option value="false">
                                                No
                                            </option>

                                        </select>

                                    </div>

                                    {(
                                        selectedItem.type === "checkbox" ||
                                        selectedItem.type === "radio" ||
                                        selectedItem.type === "dropdown"
                                    ) && (

                                        <div className="property-field">

                                            <label>
                                                Values
                                            </label>

                                            <input
                                                className="property-control"
                                                type="text"
                                                value={optionsText}
                                                placeholder="Enter values separated by comma"

                                                onChange={(e) => {

                                                    setOptionsText(
                                                        e.target.value
                                                    );

                                                }}

                                                onBlur={() => {

                                                    const options =
                                                        optionsText
                                                            .split(",")
                                                            .map(value => value.trim())
                                                            .filter(value => value !== "");

                                                    updateProperty(
                                                        "options",
                                                        options
                                                    );

                                                }}
                                            />

                                        </div>
                                    )}


                                    <div className="property-field">

                                        <label>
                                            Input Type
                                        </label>

                                        <select
                                            className="property-control"
                                            value={
                                                selectedItem.type ||
                                                "text"
                                            }
                                            onChange={(e) =>
                                                updateProperty(
                                                    "type",
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="text">
                                                Text
                                            </option>

                                            <option value="number">
                                                Number
                                            </option>

                                            <option value="email">
                                                Email
                                            </option>

                                            <option value="password">
                                                Password
                                            </option>

                                            <option value="date">
                                                Date
                                            </option>

                                            <option value="tel">
                                                Telephone
                                            </option>

                                            <option value="checkbox">
                                                Checkbox
                                            </option>

                                            <option value="radio">
                                                Radio
                                            </option>

                                            <option value="dropdown">
                                                Dropdown
                                            </option>

                                            <option value="file">
                                                File
                                            </option>

                                        </select>

                                    </div>

                                </>

                            )
                        }

                    </div>

                )
            }

            <div className="property-section">

                <div className="section-title">
                    Appearance
                </div>

                {
                    selectedItem.input !== "label" && (

                        <div className="two-column">

                            <div className="property-field">

                                <label>
                                    Border
                                </label>

                                <input
                                    className="property-control"
                                    type="number"
                                    min="0"
                                    value={
                                        selectedItem.border ?? 1
                                    }
                                    onChange={(e) =>
                                        updateNumber(
                                            "border",
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="property-field">

                                <label>
                                    Border Color
                                </label>

                                <div className="color-control">

                                    <input
                                        type="color"
                                        value={
                                            selectedItem.borderColor ||
                                            "#000000"
                                        }
                                        onChange={(e) =>
                                            updateProperty(
                                                "borderColor",
                                                e.target.value
                                            )
                                        }
                                    />

                                    <span>
                                        {
                                            selectedItem.borderColor ||
                                            "#000000"
                                        }
                                    </span>

                                </div>

                            </div>

                        </div>

                    )
                }

                {
                    (
                        selectedItem.input === "label" ||
                        selectedItem.input === "input" ||
                        selectedItem.input === "button"
                    ) && (

                        <>

                            <div className="two-column">

                                <div className="property-field">

                                    <label>
                                        Font Size
                                    </label>

                                    <input
                                        className="property-control"
                                        type="number"
                                        min="1"
                                        value={
                                            parseInt(
                                                selectedItem.fontSize ||
                                                16
                                            )
                                        }
                                        onChange={(e) =>
                                            updateNumber(
                                                "fontSize",
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="property-field">

                                    <label>
                                        Font Weight
                                    </label>

                                    <select
                                        className="property-control"
                                        value={
                                            selectedItem.fontWeight ||
                                            "normal"
                                        }
                                        onChange={(e) =>
                                            updateProperty(
                                                "fontWeight",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="normal">
                                            Normal
                                        </option>

                                        <option value="bold">
                                            Bold
                                        </option>

                                    </select>

                                </div>

                            </div>

                            <div className="property-field">

                                <label>
                                    Text Color
                                </label>

                                <div className="color-control">

                                    <input
                                        type="color"
                                        value={
                                            selectedItem.color ||
                                            "#000000"
                                        }
                                        onChange={(e) =>
                                            updateProperty(
                                                "color",
                                                e.target.value
                                            )
                                        }
                                    />

                                    <span>
                                        {
                                            selectedItem.color ||
                                            "#000000"
                                        }
                                    </span>

                                </div>

                            </div>

                        </>

                    )
                }

            </div>

            {
                selectedItem.input !==
                    "form-container" &&
                selectedItem.containerId && (

                    <div className="property-section">

                        <div className="section-title">
                            Container
                        </div>

                        <div className="property-field">

                            <label>
                                Container ID
                            </label>

                            <input
                                className="property-control"
                                value={
                                    selectedItem.containerId
                                }
                                readOnly
                            />

                        </div>

                    </div>

                )
            }

        </div>

    );

}

export default PropertyBox;
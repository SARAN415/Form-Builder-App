import React from "react";
import '../Style/EmbedFormModel.css';
function EmbedFormModal({
    form,
    onClose
}) {

    const publicFormUrl =
        `${window.location.origin}/public-form/${form.publicToken}`;

    const iframeCode =
`<iframe
    src="${publicFormUrl}"
    style={{
        width: "100%",
        height: "100vh",
        border: "none",
        display: "block"
    }}
    title="${form.name}">
</iframe>`;

    const handleCopy = async () => {

        try {

            await navigator.clipboard.writeText(
                iframeCode
            );

            alert("Embed code copied!");

        } catch (error) {

            console.error(error);

            alert("Unable to copy embed code");
        }
    };

    return (
        <div className="embed-modal-overlay">

            <div className="embed-modal">

                <div className="embed-modal-header">

                    <h2>
                        Embed Public Form
                    </h2>

                    <button onClick={onClose}>
                        ×
                    </button>

                </div>

                <p>
                    Copy the following code and
                    paste it into your website.
                </p>

                <textarea
                    value={iframeCode}
                    readOnly
                    rows={8}
                />

                <div className="embed-modal-actions">

                    <button onClick={handleCopy}>
                        Copy Code
                    </button>

                    <button onClick={onClose}>
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
}

export default EmbedFormModal;
import React, { useState,useEffect } from "react";
import "../Style/AIChatbot.css";

function AIChatbot() {

    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentControls, setCurrentControls] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {

        const handleBuilderState = (event) => {

            const detail = event.detail || {};

            setCurrentControls(
                Array.isArray(detail.controls)
                    ? detail.controls
                    : []
            );

            setSelectedId(
                detail.selectedId ?? null
            );
        };

        window.addEventListener(
            "form-builder-state",
            handleBuilderState
        );

        return () => {
            window.removeEventListener(
                "form-builder-state",
                handleBuilderState
            );
        };

    }, []);

    const sendMessage = async () => {

        if (!prompt.trim() || loading) {
            return;
        }

        const userPrompt = prompt.trim();

        // Show user's prompt immediately in chatbot
        setMessages(prev => [
            ...prev,
            {
                role: "user",
                content: userPrompt
            }
        ]);

        // Clear input
        setPrompt("");

        setLoading(true);

        try {

            const token = localStorage.getItem("accessToken");

            const response = await fetch(
                "http://localhost:8080/api/ai/control",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? {
                                "Authorization": `Bearer ${token}`
                            }
                            : {})
                    },

                    body: JSON.stringify({
                        prompt: userPrompt,
                        controls: currentControls,
                        selectedId: selectedId
                    })
                }
            );

            console.log(
                "AI HTTP status:",
                response.status
            );

            // Read response only once
            const data = await response.json();

            console.log(
                "AI response:",
                JSON.stringify(data)
            );

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "AI request failed."
                );
            }

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "AI failed to generate control."
                );
            }

            if (!data.result) {
                throw new Error("AI did not return a result.");
            }

            const aiResult = data.result;

            console.log("AI RESULT:", aiResult);

            window.dispatchEvent(
                new CustomEvent("ai-controls", {
                    detail: aiResult
                })
            );

            // Show AI response in chatbot
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: "Control added to the playground."
                }
            ]);

        } catch (error) {

            console.error(
                "AI error:",
                error
            );

            // Show error in chatbot
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        error.message ||
                        "Something went wrong."
                }
            ]);

        } finally {

            setLoading(false);
        }
    };


    const handleKeyDown = (event) => {

        // Enter → Send
        // Shift + Enter → New line

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    };


    return (
        <div className="ai-chatbot">


            {/* ================= HEADER ================= */}

            <div className="ai-chatbot-header">

                <div className="ai-header-icon">
                    ✨
                </div>

                <div className="ai-header-content">

                    <h3>
                        AI Assistant
                    </h3>

                    <span>
                        Create your form with AI
                    </span>

                </div>

            </div>


            {/* ================= CHAT AREA ================= */}

            <div className="ai-chatbot-messages">


                {/* Welcome message */}

                {(!messages ||
                    messages.length === 0) && (

                    <div className="ai-welcome">

                        <div className="ai-welcome-icon">
                            ✨
                        </div>

                        <h4>
                            Create a form with AI
                        </h4>

                        <p>
                            Describe the form you want
                            in your own words.
                        </p>


                        <div className="ai-example">

                            <div className="ai-example-title">
                                Example
                            </div>

                            <p>
                                Create an employee
                                registration form with
                                name, employee ID,
                                email, department,
                                joining date and
                                submit button.
                            </p>

                        </div>

                    </div>
                )}


                {/* ================= MESSAGES ================= */}

                {messages?.map((item, index) => (

                    <div
                        key={index}
                        className={`ai-message ${item.role}`}
                    >
                        {item.content}
                    </div>

                ))}


                {/* ================= LOADING ================= */}

                {loading && (

                    <div className="ai-message assistant">

                        <span className="ai-loading-text">
                            Creating your form
                        </span>

                        <span className="ai-loading-dots">
                            ...
                        </span>

                    </div>

                )}

            </div>


            {/* ================= PROMPT ================= */}

            <div className="ai-prompt-container">

                <div className="ai-prompt-box">

                    <textarea
                        className="ai-prompt-textarea"
                        value={prompt}
                        onChange={(event) =>
                            setPrompt(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Describe the form you want to create..."
                        disabled={loading}
                        rows={3}
                    />


                    <button
                        type="button"
                        className="ai-send-button"
                        onClick={sendMessage}
                        disabled={
                            loading ||
                            !prompt.trim()
                        }
                    >
                        {loading
                            ? "Creating..."
                            : "Send"}
                    </button>

                </div>


                <div className="ai-input-hint">
                    Press Enter to send • Shift + Enter for a new line
                </div>

            </div>

        </div>
    );
}

export default AIChatbot;
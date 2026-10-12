package com.sampleproject.demoproject.Service;

import com.openai.client.OpenAIClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.sampleproject.demoproject.Model.AIControlResponse;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class FormAIService {

    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.model}")
    private String groqModel;

    public FormAIService(
            OpenAIClient openAIClient,
            ObjectMapper objectMapper) {

        this.openAIClient = openAIClient;
        this.objectMapper = objectMapper;
    }

    public AIControlResponse generateControl(String userPrompt)
            throws Exception {

        String systemPrompt = getControlPrompt();

        String fullPrompt =
                systemPrompt +
                        "\n\nUSER REQUEST:\n" +
                        userPrompt;

        String aiResponse = callGroq(fullPrompt);

        System.out.println("========== GROQ RESPONSE ==========");
        System.out.println(aiResponse);
        System.out.println("===================================");

        AIControlResponse result =
                objectMapper.readValue(
                        aiResponse,
                        AIControlResponse.class
                );

        if (result.getAction() == null ||
                result.getAction().isBlank()) {

            throw new RuntimeException(
                    "AI response is missing required 'action' field."
            );
        }

        return result;
    }

    private String callGroq(String prompt) throws Exception {

        var response = openAIClient.chat().completions().create(
                com.openai.models.chat.completions.ChatCompletionCreateParams
                        .builder()
                        .model(groqModel)
                        .addUserMessage(prompt)
                        .build()
        );

        return response.choices()
                .get(0)
                .message()
                .content()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Groq returned an empty response."
                        )
                )
                .trim();
    }

    private String getControlPrompt() {

        return """
                VERY IMPORTANT:
                
                Your response MUST ALWAYS contain the "action" field.
                
                The root response MUST have exactly this structure:
                
                {
                  "action": "CREATE",
                  "controls": [],
                  "selectedId": null
                }
                
                Allowed action values are ONLY:
                
                "CREATE"
                "UPDATE"
                "SELECT"
                
                Rules:
                
                1. CREATE
                   - Use when the user wants to create/add/new controls or containers.
                   - "controls" must contain the new controls.
                   - Every new control MUST have "id": null.
                   - Never generate an ID.
                
                2. UPDATE
                   - Use when the user wants to modify an existing control.
                   - "controls" must contain the existing control with its exact ID.
                   - The ID MUST come from the CURRENT CONTROLS supplied to you.
                   - Never invent an ID.
                
                3. SELECT
                   - Use when the user wants to select an existing control.
                   - "controls" must be [].
                   - "selectedId" MUST contain the exact existing control ID.
                
                NEVER omit "action".
                
                NEVER return only:
                {
                  "controls": [],
                  "selectedId": null
                }
                
                The response is INVALID if "action" is missing.
                POSITION RULE:
                
                        In the React Playground, x and y represent the CENTER of the control.
                
                        The Playground calculates:
                
                        left = x - width / 2
                        top = y - height / 2
                
                        Therefore, never place a large control at x=0 or y=0.
                
                        For a 530x530 container, use safe center positions such as:
                
                        x=300, y=300
                
                        For multiple containers, keep sufficient spacing, for example:
                
                        Container 1: x=300, y=300
                        Container 2: x=900, y=300
                
                        All generated controls must remain inside a reasonable positive playground area.
        You are an AI assistant for a visual React Form Builder.

        Convert the user's natural-language request into JSON that the
        FormBuilder can execute.

        ================================================================
        RESPONSE FORMAT
        ================================================================

        ALWAYS return valid JSON only.

        NEVER return:
        - markdown
        - ```json
        - explanations
        - JavaScript
        - comments

        The root JSON object MUST contain:

        {
          "action": "...",
          "controls": [],
          "selectedId": null
        }

        The action MUST be exactly one of:

        CREATE
        UPDATE
        SELECT

        ================================================================
        CREATE
        ================================================================

        Use CREATE when the user asks to create/add/build controls.

        Examples:

        "Add a button"
        "Create a textbox"
        "Create two containers"
        "Add a name field and submit button"

        For CREATE:

        {
          "action": "CREATE",
          "controls": [
            ...
          ],
          "selectedId": null
        }

        IMPORTANT:

        If the user asks for N controls, return exactly N control
        objects inside controls.

        Example:

        "Create two containers"

        MUST return TWO objects.

        "Create three buttons"

        MUST return THREE objects.

        "Create a name field and email field"

        MUST return TWO objects.

        Never combine multiple requested controls into one object.

        ================================================================
        CONTROL STRUCTURE
        ================================================================

        FORM CONTAINER:

        {
          "id": null,
          "input": "form-container",
          "type": "text",
          "label": "",
          "options": [],
          "placeholder": "",
          "width": 530,
          "height": 530,
          "border": 2,
          "borderColor": "black",
          "backgroundColor": "white",
          "required": false,
          "readable": false,
          "x": 50,
          "y": 50,
          "containerId": null
        }

        NORMAL CONTROL:

        {
          "id": null,
          "input": "input",
          "type": "text",
          "label": "",
          "options": [],
          "placeholder": "Enter text",
          "width": 200,
          "height": 40,
          "border": 2,
          "borderColor": "black",
          "backgroundColor": "white",
          "required": false,
          "readable": false,
          "x": 50,
          "y": 50,
          "containerId": null
        }

        BUTTON:

        {
          "id": null,
          "input": "button",
          "type": "button",
          "label": "Submit",
          "options": [],
          "placeholder": "",
          "width": 200,
          "height": 40,
          "border": 2,
          "borderColor": "black",
          "backgroundColor": "white",
          "required": false,
          "readable": false,
          "x": 50,
          "y": 50,
          "containerId": null
        }

        LABEL:

        {
          "id": null,
          "input": "label",
          "type": "text",
          "label": "Label",
          "options": [],
          "placeholder": "",
          "width": 200,
          "height": 40,
          "border": 2,
          "borderColor": "black",
          "backgroundColor": "white",
          "required": false,
          "readable": false,
          "x": 50,
          "y": 50,
          "containerId": null
        }

        CHECKBOX:

        {
          "id": null,
          "input": "checkbox",
          "type": "text",
          "label": "Checkbox",
          "options": [],
          "placeholder": "",
          "width": 200,
          "height": 40,
          "border": 2,
          "borderColor": "black",
          "backgroundColor": "white",
          "required": false,
          "readable": false,
          "x": 50,
          "y": 50,
          "containerId": null
        }

        RADIO:

        {
          "id": null,
          "input": "radio",
          "type": "text",
          "label": "Radio",
          "options": [],
          "placeholder": "",
          "width": 200,
          "height": 40,
          "border": 2,
          "borderColor": "black",
          "backgroundColor": "white",
          "required": false,
          "readable": false,
          "x": 50,
          "y": 50,
          "containerId": null
        }

        DATE:

        {
          "id": null,
          "input": "date",
          "type": "date",
          "label": "Date",
          "options": [],
          "placeholder": "",
          "width": 200,
          "height": 40,
          "border": 2,
          "borderColor": "black",
          "backgroundColor": "white",
          "required": false,
          "readable": false,
          "x": 50,
          "y": 50,
          "containerId": null
        }

        TIME:

        {
          "id": null,
          "input": "time",
          "type": "time",
          "label": "Time",
          "options": [],
          "placeholder": "",
          "width": 200,
          "height": 40,
          "border": 2,
          "borderColor": "black",
          "backgroundColor": "white",
          "required": false,
          "readable": false,
          "x": 50,
          "y": 50,
          "containerId": null
        }

        ================================================================
        IDS
        ================================================================

        For NEW controls:

        Do not invent a permanent application ID.

        Return:

        "id": null

        React will generate the real ID.

        For EXISTING controls:

        ALWAYS preserve the existing ID.

        If the current controls contain:

        {
          "id": 123
        }

        and the user asks to modify it, return:

        {
          "id": 123
        }

        Never change an existing ID.

        ================================================================
        POSITION
        ================================================================

        Every newly created control must have x and y.

        Use the user's requested position.

        Examples:

        "top left"
        -> x=50, y=50

        "top right"
        -> place near the right side

        "bottom left"
        -> place near the bottom left

        "bottom right"
        -> place near the bottom right

        "center"
        -> place in the center

        If the user does not specify a position, choose a reasonable
        position that does not overlap existing controls.

        Use the CURRENT CONTROLS information when calculating positions.

        ================================================================
        CONTAINER
        ================================================================

        Normal controls should belong to a form container.

        If CURRENT SELECTED CONTAINER is supplied, use its ID as
        containerId.

        If the user specifies a container ID, use that ID.

        If there is exactly one existing form container, use its ID.

        Form containers themselves must have:

        "containerId": null

        ================================================================
        UPDATE
        ================================================================

        Use UPDATE when the user wants to modify an existing control.

        Examples:

        "Change the selected container background to red"

        "Change button 123 background to blue"

        "Make the selected field wider"

        "Change label 100 to Name"

        "Move control 123"

        IMPORTANT:

        UPDATE MUST NOT create a new control.

        UPDATE MUST preserve the existing ID.

        UPDATE MUST modify ONLY the requested properties.

        Example:

        User:

        "Change control 123 background to red"

        Return:

        {
          "action": "UPDATE",
          "controls": [
            {
              "id": 123,
              "backgroundColor": "red"
            }
          ],
          "selectedId": null
        }

        Do NOT return the entire control.

        ================================================================
        SELECTED CONTROL
        ================================================================

        The application may provide:

        SELECTED CONTROL ID: 123

        If the user says:

        "change the background to red"

        "make it blue"

        "increase its width"

        "change its border"

        then modify ID 123.

        NEVER modify another control.

        Example:

        {
          "action": "UPDATE",
          "controls": [
            {
              "id": 123,
              "backgroundColor": "red"
            }
          ],
          "selectedId": 123
        }

        ================================================================
        SELECT BY ID
        ================================================================

        If the user says:

        "select 123"

        "select control 123"

        "select the button with id 123"

        return:

        {
          "action": "SELECT",
          "controls": [],
          "selectedId": 123
        }

        Do not create or modify a control.

        ================================================================
        BACKGROUND COLOR
        ================================================================

        All controls support:

        backgroundColor

        Examples:

        "Make the selected container red"

        -> UPDATE selected container:

        {
          "action": "UPDATE",
          "controls": [
            {
              "id": SELECTED_ID,
              "backgroundColor": "red"
            }
          ],
          "selectedId": SELECTED_ID
        }

        "Change button 123 background to blue"

        ->

        {
          "action": "UPDATE",
          "controls": [
            {
              "id": 123,
              "backgroundColor": "blue"
            }
          ],
          "selectedId": 123
        }

        ================================================================
        OTHER STYLE PROPERTIES
        ================================================================

        Supported properties:

        width
        height
        border
        borderColor
        backgroundColor
        x
        y

        ================================================================
        OTHER CONTROL PROPERTIES
        ================================================================

        Supported properties:

        label
        placeholder
        options
        required
        readable

        When modifying one property, do not change unrelated properties.

        ================================================================
        CURRENT CONTROLS
        ================================================================

        The application may provide the current controls after this
        system prompt.

        Use them to:

        - identify existing IDs
        - identify containers
        - identify selected controls
        - calculate positions
        - avoid overlapping controls
        - determine whether a request is CREATE or UPDATE

        Never invent an existing control.

        ================================================================
        FINAL RULE
        ================================================================

        CREATE = add new controls.

        UPDATE = modify existing controls.

        SELECT = select an existing control.

        Never treat UPDATE as CREATE.

        Never treat SELECT as CREATE.

        Always return valid JSON only.
        
                IMPORTANT ID RULE:
                
                For CREATE:
                - Always return "id": null.
                - Never invent IDs.
                - React will generate the actual ID.
                
                For UPDATE:
                - The "id" MUST be the exact existing control ID.
                - Never change the existing ID.
                
                For SELECT:
                - "selectedId" MUST be the exact existing control ID.
                - Never invent a new ID.
                
                IDs are the identity of controls.
                Never use labels as IDs.
                Never guess IDs.
        """;
    }
}
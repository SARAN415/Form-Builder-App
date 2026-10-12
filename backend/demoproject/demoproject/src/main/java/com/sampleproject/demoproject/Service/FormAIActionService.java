package com.sampleproject.demoproject.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

import com.sampleproject.demoproject.Model.Form;
import com.sampleproject.demoproject.Model.FormDatabaseConfig;
import com.sampleproject.demoproject.Repository.FormDatabaseConfigRepository;
import com.sampleproject.demoproject.Repository.FormRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.UUID;

@Service
public class FormAIActionService {

    private final FormRepository formRepository;
    private final FormDatabaseConfigRepository databaseConfigRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    @Value("${spring.datasource.driverClassName}")
    private String datasourceDriver;

    public FormAIActionService(
            FormRepository formRepository,
            FormDatabaseConfigRepository databaseConfigRepository
    ) {
        this.formRepository = formRepository;
        this.databaseConfigRepository =
                databaseConfigRepository;
    }

    private Form getForm(String formId) {

        return formRepository.findById(formId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Form not found: " + formId
                        )
                );
    }

    private ArrayNode getControls(
            ObjectNode root
    ) {

        JsonNode controlsNode =
                root.get("controls");

        if (controlsNode == null ||
                !controlsNode.isArray()) {

            throw new RuntimeException(
                    "Form does not contain controls array"
            );
        }

        return (ArrayNode) controlsNode;
    }

    private ObjectNode findControl(
            ArrayNode controls,
            String controlId
    ) {

        for (JsonNode node : controls) {

            if (!node.isObject()) {
                continue;
            }

            String id =
                    node.path("id").asText();

            if (controlId.equals(id)) {

                return (ObjectNode) node;
            }
        }

        throw new RuntimeException(
                "Control not found: " + controlId
        );
    }

    private void saveForm(
            Form form,
            ObjectNode root
    ) throws Exception {

        form.setFormData(
                objectMapper.writeValueAsString(root)
        );

        formRepository.save(form);
    }

    public String moveControl(
            String formId,
            String controlId,
            double x,
            double y
    ) throws Exception {

        Form form = getForm(formId);

        ObjectNode root =
                (ObjectNode)
                        objectMapper.readTree(
                                form.getFormData()
                        );

        ArrayNode controls =
                getControls(root);

        ObjectNode control =
                findControl(
                        controls,
                        controlId
                );

        control.put("x", x);
        control.put("y", y);

        saveForm(form, root);

        return """
                {
                    "success": true,
                    "message": "Control moved successfully"
                }
                """;
    }

    public String resizeControl(
            String formId,
            String controlId,
            double width,
            double height
    ) throws Exception {

        if (width <= 0 || height <= 0) {

            throw new RuntimeException(
                    "Width and height must be greater than zero"
            );
        }

        Form form = getForm(formId);

        ObjectNode root =
                (ObjectNode)
                        objectMapper.readTree(
                                form.getFormData()
                        );

        ArrayNode controls =
                getControls(root);

        ObjectNode control =
                findControl(
                        controls,
                        controlId
                );

        control.put("width", width);
        control.put("height", height);

        saveForm(form, root);

        return """
                {
                    "success": true,
                    "message": "Control resized successfully"
                }
                """;
    }

    public String updateLabel(
            String formId,
            String controlId,
            String label
    ) throws Exception {

        Form form = getForm(formId);

        ObjectNode root =
                (ObjectNode)
                        objectMapper.readTree(
                                form.getFormData()
                        );

        ArrayNode controls =
                getControls(root);

        ObjectNode control =
                findControl(
                        controls,
                        controlId
                );

        control.put("label", label);

        saveForm(form, root);

        return """
                {
                    "success": true,
                    "message": "Label updated successfully"
                }
                """;
    }

    public String updateStyle(
            String formId,
            String controlId,
            String backgroundColor,
            String borderColor,
            double border
    ) throws Exception {

        Form form = getForm(formId);

        ObjectNode root =
                (ObjectNode)
                        objectMapper.readTree(
                                form.getFormData()
                        );

        ArrayNode controls =
                getControls(root);

        ObjectNode control =
                findControl(
                        controls,
                        controlId
                );

        control.put(
                "backgroundColor",
                backgroundColor
        );

        control.put(
                "borderColor",
                borderColor
        );

        control.put(
                "border",
                border
        );

        saveForm(form, root);

        return """
                {
                    "success": true,
                    "message": "Style updated successfully"
                }
                """;
    }

    public String addControl(
            String formId,
            JsonNode args
    ) throws Exception {

        Form form = getForm(formId);

        ObjectNode root =
                (ObjectNode)
                        objectMapper.readTree(
                                form.getFormData()
                        );

        ArrayNode controls =
                getControls(root);

        ObjectNode control =
                objectMapper.createObjectNode();

        String newId =
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8);

        control.put("id", newId);

        control.put(
                "input",
                args.path("input").asText()
        );

        control.put(
                "type",
                args.path("type").asText()
        );

        control.put(
                "label",
                args.path("label").asText()
        );

        control.put(
                "x",
                args.path("x").asDouble()
        );

        control.put(
                "y",
                args.path("y").asDouble()
        );

        control.put(
                "width",
                args.path("width").asDouble()
        );

        control.put(
                "height",
                args.path("height").asDouble()
        );

        control.put(
                "backgroundColor",
                args.path("backgroundColor").asText()
        );

        control.put(
                "borderColor",
                args.path("borderColor").asText()
        );

        control.put(
                "border",
                args.path("border").asDouble()
        );

        controls.add(control);

        saveForm(form, root);

        return objectMapper.writeValueAsString(
                java.util.Map.of(
                        "success", true,
                        "message", "Control added successfully",
                        "controlId", newId
                )
        );
    }


    public String deleteControl(
            String formId,
            String controlId
    ) throws Exception {

        Form form = getForm(formId);

        ObjectNode root =
                (ObjectNode)
                        objectMapper.readTree(
                                form.getFormData()
                        );

        ArrayNode controls =
                getControls(root);

        boolean removed = false;

        for (int i = 0; i < controls.size(); i++) {

            JsonNode node =
                    controls.get(i);

            if (controlId.equals(
                    node.path("id").asText()
            )) {

                controls.remove(i);
                removed = true;
                break;
            }
        }

        if (!removed) {

            throw new RuntimeException(
                    "Control not found: " +
                            controlId
            );
        }

        saveForm(form, root);

        return """
                {
                    "success": true,
                    "message": "Control deleted successfully"
                }
                """;
    }

    @Transactional
    public Form createFormFromAI(String formData) throws Exception {

        JsonNode parsed = objectMapper.readTree(formData);

        if (!parsed.isObject()) {
            throw new RuntimeException(
                    "AI generated invalid formData"
            );
        }

        ObjectNode root = (ObjectNode) parsed;

        JsonNode controlsNode = root.get("controls");

        if (controlsNode == null || !controlsNode.isArray()) {
            throw new RuntimeException(
                    "AI formData must contain controls array"
            );
        }

        ArrayNode controls = (ArrayNode) controlsNode;

        // Generate safe IDs and apply defaults
        for (JsonNode node : controls) {

            if (!node.isObject()) {
                continue;
            }

            ObjectNode control = (ObjectNode) node;

            // Always generate ID on backend
            control.put(
                    "id",
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
            );

            // Position
            if (!control.has("x")) {
                control.put("x", 50);
            }

            if (!control.has("y")) {
                control.put("y", 50);
            }

            // Size
            if (!control.has("width")) {
                control.put("width", 250);
            }

            if (!control.has("height")) {
                control.put("height", 45);
            }

            // Style
            if (!control.has("backgroundColor")) {
                control.put("backgroundColor", "#ffffff");
            }

            if (!control.has("borderColor")) {
                control.put("borderColor", "#cccccc");
            }

            if (!control.has("border")) {
                control.put("border", 1);
            }
        }

        // Generate Form ID
        String formId = UUID.randomUUID()
                .toString()
                .substring(0, 8);

        // Create Form
        Form form = new Form(formId);

        // Generate public token
        form.setPublicToken(
                com.sampleproject.demoproject.util
                        .PublicTokenGenerator.generate()
        );

        // Save final formData
        form.setFormData(
                objectMapper.writeValueAsString(root)
        );

        // Save Form
        Form savedForm = formRepository.save(form);

        // Create default DB configuration
        createDefaultDatabaseConfig(
                savedForm.getId()
        );

        return savedForm;
    }


    private void createDefaultDatabaseConfig(
            String formId
    ) {

        FormDatabaseConfig config =
                new FormDatabaseConfig();

        config.setId(
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
        );

        config.setFormId(formId);

        config.setDatabaseType("MYSQL");

        config.setUrl(datasourceUrl);

        config.setDriverClassName(
                datasourceDriver
        );

        config.setDatabaseName(
                extractDatabaseName(datasourceUrl)
        );

        config.setUsername(
                datasourceUsername
        );

        config.setPassword(
                datasourcePassword
        );

        databaseConfigRepository.save(config);
    }


    private String extractDatabaseName(
            String url
    ) {

        if (url == null) {
            return "";
        }

        int slash =
                url.lastIndexOf("/");

        if (slash == -1) {
            return "";
        }

        String db =
                url.substring(slash + 1);

        int question =
                db.indexOf("?");

        if (question != -1) {
            db =
                    db.substring(
                            0,
                            question
                    );
        }

        return db;
    }

    @Transactional
    public String deleteForm(
            String formId
    ) throws Exception {

        Form form = getForm(formId);

        FormDatabaseConfig config =
                databaseConfigRepository
                        .findByFormId(formId)
                        .orElse(null);

        if (config != null) {

            dropResponseTable(
                    formId,
                    config
            );
        }

        databaseConfigRepository
                .deleteByFormId(formId);


        Path linkFile =
                Paths.get(
                        "uploads",
                        "forms",
                        formId + ".txt"
                );

        Files.deleteIfExists(
                linkFile
        );

        formRepository.deleteById(formId);

        return """
                {
                    "success": true,
                    "message": "Form deleted successfully"
                }
                """;
    }

    private void dropResponseTable(
            String formId,
            FormDatabaseConfig config
    ) {

        String tableName =
                "Form_" +
                        formId +
                        "_Responses";

        try {

            Class.forName(
                    config.getDriverClassName()
            );

            try (
                    Connection connection =
                            DriverManager.getConnection(
                                    config.getUrl(),
                                    config.getUsername(),
                                    config.getPassword()
                            );

                    Statement statement =
                            connection.createStatement()
            ) {

                statement.executeUpdate(
                        "DROP TABLE IF EXISTS `" +
                                tableName +
                                "`"
                );
            }

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Failed to delete response table",
                    e
            );
        }
    }
}

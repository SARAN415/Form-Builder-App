package com.sampleproject.demoproject.Controller;

import com.sampleproject.demoproject.Service.DatabaseService;
import com.sampleproject.demoproject.Service.FormLinkFileService;
import com.sampleproject.demoproject.Service.FormResponseService;
import com.sampleproject.demoproject.Model.*;
import com.sampleproject.demoproject.Repository.FormDatabaseConfigRepository;
import com.sampleproject.demoproject.Repository.FormRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.*;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.sampleproject.demoproject.Repository.FormResponseRepository;
import com.sampleproject.demoproject.util.PublicTokenGenerator;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.bson.Document;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "http://localhost:3000")
public class FormController {

    private final FormRepository formRepository;
    private final FormResponseRepository responseRepository;
    private final FormDatabaseConfigRepository formDatabaseConfigRepository;
    private final DatabaseService databaseService;
    private final FormResponseService formResponseService;
    private final FormLinkFileService formLinkFileService;

    public FormController(
            FormRepository formRepository,
            FormResponseRepository responseRepository,
            FormDatabaseConfigRepository formDatabaseConfigRepository,
            DatabaseService databaseService,
            FormResponseService formResponseService,
            FormLinkFileService formLinkFileService) {

        this.formRepository = formRepository;
        this.responseRepository = responseRepository;
        this.formDatabaseConfigRepository = formDatabaseConfigRepository;
        this.databaseService=databaseService;
        this.formResponseService=formResponseService;
        this.formLinkFileService=formLinkFileService;
    }

//    @PostMapping
//    public ResponseEntity<Form> createForm(
//            @RequestBody CreateFormRequest request
//    ) {
//
//        // 1. Generate Form ID
//
//        String formId =
//                UUID.randomUUID()
//                        .toString()
//                        .substring(0, 8);
//
//
//        // 2. Create Form
//
//        Form form =
//                new Form(formId);
//
//
//        // 3. Save Form
//
//        Form savedForm =
//                formRepository.save(form);
//
//
//        // 4. Get database configuration
//
//        DatabaseConfig db =
//                request.getDatabase();
//
//        System.out.println("Database config db: "+db);
//
//
//        // 5. Create database configuration
//
//        FormDatabaseConfig config =
//                new FormDatabaseConfig();
//
//
//        config.setId(
//                UUID.randomUUID().toString().substring(0, 8)
//        );
//
//        config.setFormId(
//                savedForm.getId()
//        );
//
//        config.setDatabaseType(db.getDatabaseType());
//
//        config.setUrl(
//                db.getUrl()
//        );
//
//        config.setDriverClassName(
//                db.getDriverClassName()
//        );
//
//        config.setDatabaseName(db.getDatabaseName());
//
//        config.setUsername(
//                db.getUsername()
//        );
//
//        config.setPassword(
//                db.getPassword()
//        );
//
//
//        // 6. Save configuration
//
//        formDatabaseConfigRepository.save(
//                config
//        );
//
//
//        // 7. Return Form ID
//
//        return ResponseEntity.ok(
//                savedForm
//        );
//    }

    @PostMapping
    public ResponseEntity<?> createForm(
            @RequestBody CreateFormRequest request
    ) {

        try {

            String formId =
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8);

            Form formTable =
                    new Form(formId);


            // Generate PUBLIC TOKEN
            String publicToken =
                    PublicTokenGenerator.generate();

            formTable.setPublicToken(publicToken);
            formTable.setFormData(request.getFormData());

            // Save form
            Form savedForm =
                    formRepository.save(formTable);

            DatabaseConfig db = request.getDatabase();

            System.out.println("Database config db: "+db);


            FormDatabaseConfig config =
                    new FormDatabaseConfig();


            config.setId(
                    UUID.randomUUID().toString().substring(0, 8)
            );

            config.setFormId(
                    savedForm.getId()
            );

            config.setDatabaseType(db.getDatabaseType());

            config.setUrl(
                    db.getUrl()
            );

            config.setDriverClassName(
                    db.getDriverClassName()
            );

            config.setDatabaseName(db.getDatabaseName());

            config.setUsername(
                    db.getUsername()
            );

            config.setPassword(
                    db.getPassword()
            );


            // 6. Save configuration

            formDatabaseConfigRepository.save(
                    config
            );

            return ResponseEntity.ok(savedForm);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create form");
        }
    }


//    public Form createForm() {
//
//        String id = UUID.randomUUID()
//                .toString()
//                .substring(0, 8);
//
//        Form form = new Form(id);
//
//        return formRepository.save(form);
//    }

    @GetMapping("/{id}")
    public Form getForm(@PathVariable String id) {

        return formRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Form not found: " + id)
                );
    }

    @GetMapping
    public ResponseEntity<?> getAllForms() {

        try {
            List<Form> forms = formRepository.findAll();

            return ResponseEntity.ok(forms);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message", "Unable to load forms",
                            "error", e.getMessage()
                    ));
        }
    }

    @PostMapping("/test")
    public ResponseEntity<String> testDatabaseConnection(
            @RequestBody FormDatabaseConfig config) {

        try {

            databaseService.testConnection(config);

            return ResponseEntity.ok(
                    "Database connection successful"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Database connection failed: "
                                    + e.getMessage()
                    );
        }
    }

    private void saveToSqlDatabase(
            String formId,
            FormDatabaseConfig config
    ) {

        try {

            // =========================================
            // 1. Load JDBC driver
            // =========================================

            Class.forName(
                    config.getDriverClassName()
            );


            // =========================================
            // 2. Connect to configured database
            // =========================================

            try (
                    Connection connection =
                            DriverManager.getConnection(
                                    config.getUrl(),
                                    config.getUsername(),
                                    config.getPassword()
                            )
            ) {

                System.out.println(
                        "Connected to database: "
                                + config.getDatabaseType()
                );


                // =========================================
                // 3. Create Form table
                // =========================================

                String createFormTableSql = """
                    CREATE TABLE IF NOT EXISTS Form (
                        id VARCHAR(255) PRIMARY KEY,
                        created_at TIMESTAMP
                    )
                    """;


                try (
                        Statement statement =
                                connection.createStatement()
                ) {

                    statement.executeUpdate(
                            createFormTableSql
                    );
                }


                // =========================================
                // 4. Create Form_Database_Config table
                // =========================================

                String createConfigTableSql = """
                    CREATE TABLE IF NOT EXISTS Form_Database_Config (
                        id VARCHAR(255) PRIMARY KEY,
                        form_id VARCHAR(255),
                        database_type VARCHAR(50),
                        url TEXT,
                        driver_class_name VARCHAR(255),
                        database_name VARCHAR(255),
                        username VARCHAR(255),
                        password TEXT
                    )
                    """;


                try (
                        Statement statement =
                                connection.createStatement()
                ) {

                    statement.executeUpdate(
                            createConfigTableSql
                    );
                }


                // =========================================
                // 5. Insert Form
                // =========================================

                String insertFormSql =
                        """
                        INSERT INTO Form
                        (id, created_at)
                        VALUES (?, ?)
                        """;


                try (
                        PreparedStatement statement =
                                connection.prepareStatement(
                                        insertFormSql
                                )
                ) {

                    statement.setString(
                            1,
                            formId
                    );

                    statement.setTimestamp(
                            2,
                            Timestamp.valueOf(
                                    LocalDateTime.now()
                            )
                    );

//                    statement.setString(
//                            3,
//                            answers
//                    );

                    statement.executeUpdate();
                }


                // =========================================
                // 6. Insert database configuration
                // =========================================

                String insertConfigSql =
                        """
                        INSERT INTO Form_Database_Config
                        (
                            id,
                            form_id,
                            database_type,
                            url,
                            driver_class_name,
                            database_name,
                            username,
                            password
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """;


                try (
                        PreparedStatement statement =
                                connection.prepareStatement(
                                        insertConfigSql
                                )
                ) {

                    statement.setString(
                            1,
                            UUID.randomUUID()
                                    .toString()
                    );

                    statement.setString(
                            2,
                            config.getFormId()
                    );

                    statement.setString(
                            3,
                            config.getDatabaseType()
                    );

                    statement.setString(
                            4,
                            config.getUrl()
                    );

                    statement.setString(
                            5,
                            config.getDriverClassName()
                    );

                    statement.setString(
                            6,
                            config.getDatabaseName()
                    );

                    statement.setString(
                            7,
                            config.getUsername()
                    );

                    statement.setString(
                            8,
                            config.getPassword()
                    );

                    statement.executeUpdate();
                }

                System.out.println(
                        "Form, database configuration and response "
                                + "saved successfully."
                );
            }


        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Failed to save data to database: "
                            + e.getMessage(),
                    e
            );
        }
    }

    private void saveToSQLResponse(
            String formId,
            String answers,
            FormDatabaseConfig config
    ) {

        try {

            // =========================================
            // 1. Load JDBC driver
            // =========================================

            Class.forName(
                    config.getDriverClassName()
            );


            // =========================================
            // 2. Connect to configured database
            // =========================================

            try (
                    Connection connection =
                            DriverManager.getConnection(
                                    config.getUrl(),
                                    config.getUsername(),
                                    config.getPassword()
                            )
            ) {

                System.out.println(
                        "Connected to database: "
                                + config.getDatabaseType()
                );


                // =========================================
                // 3. Create table name
                // =========================================

                String tableName =
                        "Form_"
                                + formId
                                + "_Responses";


                // =========================================
                // 4. Parse answers JSON
                // =========================================

                ObjectMapper objectMapper =
                        new ObjectMapper();

                JsonNode answersJson =
                        objectMapper.readTree(
                                answers
                        );


                // =========================================
                // 5. Create response table
                // =========================================

                String createTableSql =
                        "CREATE TABLE IF NOT EXISTS `"
                                + tableName
                                + "` ("
                                + "`id` VARCHAR(36) PRIMARY KEY, "
                                + "`submitted_at` TIMESTAMP"
                                + ")";


                try (
                        Statement statement =
                                connection.createStatement()
                ) {

                    statement.executeUpdate(
                            createTableSql
                    );
                }


                // =========================================
                // 6. Add dynamic columns
                // =========================================

                for (
                        Map.Entry<String, JsonNode> entry :
                        answersJson.properties()
                ) {

                    String fieldName =
                            entry.getKey();


                    // Escape backticks
                    String columnName =
                            fieldName.replace(
                                    "`",
                                    "``"
                            );


                    // =====================================
                    // Check whether column exists
                    // =====================================

                    String checkColumnSql =
                            "SELECT COUNT(*) "
                                    + "FROM INFORMATION_SCHEMA.COLUMNS "
                                    + "WHERE TABLE_SCHEMA = DATABASE() "
                                    + "AND TABLE_NAME = ? "
                                    + "AND COLUMN_NAME = ?";


                    boolean columnExists = false;


                    try (
                            PreparedStatement checkStatement =
                                    connection.prepareStatement(
                                            checkColumnSql
                                    )
                    ) {

                        checkStatement.setString(
                                1,
                                tableName
                        );

                        checkStatement.setString(
                                2,
                                fieldName
                        );


                        try (
                                ResultSet resultSet =
                                        checkStatement.executeQuery()
                        ) {

                            if (resultSet.next()) {

                                columnExists =
                                        resultSet.getInt(1) > 0;
                            }
                        }
                    }


                    // =====================================
                    // Add column if not exists
                    // =====================================

                    if (!columnExists) {

                        String alterTableSql =
                                "ALTER TABLE `"
                                        + tableName
                                        + "` ADD COLUMN `"
                                        + columnName
                                        + "` TEXT";


                        try (
                                Statement alterStatement =
                                        connection.createStatement()
                        ) {

                            alterStatement.executeUpdate(
                                    alterTableSql
                            );
                        }
                    }
                }


                // =========================================
                // 7. Prepare INSERT columns
                // =========================================

                List<String> columns =
                        new ArrayList<>();

                List<String> placeholders =
                        new ArrayList<>();


                // ID

                columns.add("`id`");
                placeholders.add("?");


                // Dynamic fields

                for (
                        Map.Entry<String, JsonNode> entry :
                        answersJson.properties()
                ) {

                    String fieldName =
                            entry.getKey();

                    String columnName =
                            fieldName.replace(
                                    "`",
                                    "``"
                            );


                    columns.add(
                            "`"
                                    + columnName
                                    + "`"
                    );

                    placeholders.add("?");
                }


                // Submitted time

                columns.add(
                        "`submitted_at`"
                );

                placeholders.add("?");


                // =========================================
                // 8. Create INSERT SQL
                // =========================================

                String insertResponseSql =
                        "INSERT INTO `"
                                + tableName
                                + "` ("
                                + String.join(
                                ", ",
                                columns
                        )
                                + ") VALUES ("
                                + String.join(
                                ", ",
                                placeholders
                        )
                                + ")";


                // =========================================
                // 9. Insert response
                // =========================================

                try (
                        PreparedStatement statement =
                                connection.prepareStatement(
                                        insertResponseSql
                                )
                ) {

                    int parameterIndex = 1;


                    // =====================================
                    // Response ID
                    // =====================================

                    statement.setString(
                            parameterIndex++,
                            UUID.randomUUID()
                                    .toString()
                    );


                    // =====================================
                    // Dynamic values
                    // =====================================

                    for (
                            Map.Entry<String, JsonNode> entry :
                            answersJson.properties()
                    ) {

                        JsonNode value =
                                entry.getValue();


                        String valueString;


                        // Object / File

                        if (value.isObject()) {

                            valueString =
                                    objectMapper
                                            .writeValueAsString(
                                                    value
                                            );

                        }

                        // Array

                        else if (value.isArray()) {

                            valueString =
                                    objectMapper
                                            .writeValueAsString(
                                                    value
                                            );

                        }

                        // Normal value

                        else {

                            valueString =
                                    value.asText();
                        }


                        statement.setString(
                                parameterIndex++,
                                valueString
                        );
                    }


                    // =====================================
                    // Submitted time
                    // =====================================

                    statement.setTimestamp(
                            parameterIndex,
                            Timestamp.valueOf(
                                    LocalDateTime.now()
                            )
                    );


                    // =====================================
                    // Execute INSERT
                    // =====================================

                    statement.executeUpdate();


                    System.out.println(
                            "Response saved successfully "
                                    + "to table: "
                                    + tableName
                    );
                }
            }

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Failed to save data to database: "
                            + e.getMessage(),
                    e
            );
        }
    }

    private void saveToMongoDB(
            String formId,
            String answers,
            FormDatabaseConfig config
    ) {

        if (
                config.getUrl() == null ||
                        config.getUrl().isBlank()
        ) {

            throw new RuntimeException(
                    "MongoDB connection URL is required"
            );
        }


        if (
                config.getDatabaseName() == null ||
                        config.getDatabaseName().isBlank()
        ) {

            throw new RuntimeException(
                    "MongoDB database name is required"
            );
        }


        try (
                MongoClient mongoClient =
                        MongoClients.create(
                                config.getUrl()
                        )
        ) {

            // =========================================
            // Get database
            // =========================================

            MongoDatabase database =
                    mongoClient.getDatabase(
                            config.getDatabaseName()
                    );


            // =========================================
            // Collection
            // =========================================

            String collectionName =
                    "form_"
                            + formId
                            + "_responses";


            MongoCollection<Document>
                    collection =
                    database.getCollection(
                            collectionName
                    );


            // =========================================
            // Parse answers JSON
            // =========================================

            Document answerDocument =
                    Document.parse(
                            answers
                    );


            // =========================================
            // Add response ID
            // =========================================

            answerDocument.put(
                    "_id",
                    UUID.randomUUID()
                            .toString()
            );


            // =========================================
            // Insert
            // =========================================

            collection.insertOne(
                    answerDocument
            );


            System.out.println(
                    "Response saved successfully"
            );
        }
    }

    @PostMapping(
            value = "/{token}/responses",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<String> saveResponse(
            @PathVariable String token,

            @RequestParam("answers")
            String answers,

            @RequestParam(
                    value = "files",
                    required = false
            )
            List<MultipartFile> files,

            @RequestParam(
                    value = "fileLabels",
                    required = false
            )
            List<String> fileLabels)
    {

        try {
            Map<String, Object> answerData =
                    new ObjectMapper().readValue(
                            answers,
                            new TypeReference<Map<String, Object>>() {}
                    );


            if (files != null) {

                for (int i = 0; i < files.size(); i++) {

                    MultipartFile file =
                            files.get(i);

                    String label =
                            fileLabels.get(i);

                    String fileId =
                            formResponseService.saveFile(file);

                    Map<String, Object> fileData =
                            new HashMap<>();

                    fileData.put(
                            "fileName",
                            file.getOriginalFilename()
                    );

                    fileData.put(
                            "size",
                            file.getSize()
                    );


                    // Use the actual form field label
                    answerData.put(
                            label,
                            fileData
                    );
                }
            }

            String finalAnswers =
                    new ObjectMapper()
                            .writeValueAsString(
                                    answerData
                            );

//            String result =
//                    formResponseService.saveResponse(
//                            formId,
//                            answers,
//                            files
//                    );

            // 1. Check whether form exists
            Form form=formRepository
                    .findByPublicToken(token)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Form not found for public token: " + token
                            )
                    );

            String formId = form.getId();


            // 2. Get database configuration for this form
            FormDatabaseConfig config =
                    formDatabaseConfigRepository
                            .findByFormId(formId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Database configuration not found for form: "
                                                    + formId
                                    )
                            );


            // 3. Get database type
            String databaseType =
                    config.getDatabaseType();


            if (databaseType == null ||
                    databaseType.isBlank()) {

                throw new RuntimeException(
                        "Database type is not configured"
                );
            }


            // =================================================
            // SQL DATABASES
            // =================================================

            if (
                    databaseType.equalsIgnoreCase("MYSQL") ||
                            databaseType.equalsIgnoreCase("POSTGRESQL") ||
                            databaseType.equalsIgnoreCase("H2")
            ) {

                saveToSQLResponse(
                        formId,
                        finalAnswers,
                        config
                );

            }


            // =================================================
            // MONGODB
            // =================================================

            else if (
                    databaseType.equalsIgnoreCase("MONGODB")
            ) {

                saveToMongoDB(
                        formId,
                        answers,
                        config
                );

            }


            // =================================================
            // UNSUPPORTED DATABASE
            // =================================================

            else {

                throw new RuntimeException(
                        "Unsupported database type: "
                                + databaseType
                );
            }


            return ResponseEntity.ok(
                    "Response saved successfully"
            );


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to save response: "
                                    + e.getMessage()
                    );
        }
    }
//    public FormResponse saveResponse(
//            @PathVariable String formId,
//            @RequestBody String answers) {
//
//        // Check whether form exists
//        formRepository
//                .findById(formId)
//                .orElseThrow(() ->
//                        new RuntimeException(
//                                "Form not found: " + formId
//                        )
//                );
//
//        FormResponse response =
//                new FormResponse();
//
//        response.setFormId(formId);
//        response.setAnswers(answers);
//
//        return responseRepository.save(response);
//    }

    @GetMapping("/files")
    public ResponseEntity<List<Map<String, Object>>> getAllFiles() {

        try {
//            System.out.println("Files Uploading");

            List<Map<String, Object>> result =
                    new ArrayList<>();


            // Get all forms that have database configuration
            List<FormDatabaseConfig> configs =
                    formDatabaseConfigRepository.findAll();

//            System.out.println(
//                    "CONFIG COUNT = " + configs.size()
//            );


            for (FormDatabaseConfig config : configs) {

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
                                    )
                    ) {

                        DatabaseMetaData metaData =
                                connection.getMetaData();


                        try (
                                ResultSet tables =
                                        metaData.getTables(
                                                null,
                                                null,
                                                null,
                                                new String[]{"TABLE"}
                                        )
                        ) {

                            while (
                                    tables.next()
                            ) {

                                String tableName =
                                        tables.getString(
                                                "TABLE_NAME"
                                        );


                                if (
                                        tableName == null ||
                                                !tableName
                                                        .toLowerCase()
                                                        .startsWith(
                                                                "form_"
                                                        ) ||
                                                !tableName
                                                        .toLowerCase()
                                                        .endsWith(
                                                                "_responses"
                                                        )
                                ) {

                                    continue;
                                }


                                // =================================
                                // Extract formId
                                // =================================

                                String formId =
                                        tableName.substring(
                                                5,
                                                tableName.length()
                                                        - 10
                                        );


                                // =================================
                                // Get columns
                                // =================================

                                List<String> columns =
                                        new ArrayList<>();


                                try (
                                        ResultSet columnResult =
                                                metaData.getColumns(
                                                        null,
                                                        null,
                                                        tableName,
                                                        null
                                                )
                                ) {

                                    while (
                                            columnResult.next()
                                    ) {

                                        String columnName =
                                                columnResult
                                                        .getString(
                                                                "COLUMN_NAME"
                                                        );

                                        if (
                                                !"id".equalsIgnoreCase(
                                                        columnName
                                                )
                                        ) {

                                            columns.add(
                                                    columnName
                                            );
                                        }
                                    }
                                }


                                // =================================
                                // Read response rows
                                // =================================

                                String sql =
                                        "SELECT * FROM "
                                                + tableName;


                                try (
                                        Statement statement =
                                                connection
                                                        .createStatement();

                                        ResultSet rs =
                                                statement
                                                        .executeQuery(
                                                                sql
                                                        )
                                ) {

                                    while (
                                            rs.next()
                                    ) {

                                        for (
                                                String column :
                                                columns
                                        ) {

                                            String value =
                                                    rs.getString(
                                                            column
                                                    );

                                            String responseId =
                                                    rs.getString("id");


                                            if (
                                                    value == null ||
                                                            value.isBlank()
                                            ) {
                                                continue;
                                            }


                                            // =================================
                                            // Check if JSON contains fileId
                                            // =================================

                                            try {

                                                ObjectMapper mapper =
                                                        new ObjectMapper();


                                                Map<String, Object>
                                                        fileData =
                                                        mapper.readValue(
                                                                value,
                                                                new TypeReference<
                                                                        Map<String, Object>
                                                                        >() {}
                                                        );


                                                for (Map.Entry<String, Object> entry :
                                                        fileData.entrySet()) {

                                                    String label =
                                                            entry.getKey();

                                                    Object values =
                                                            entry.getValue();

                                                    if (!(values instanceof Map)) {
                                                        continue;
                                                    }

                                                    Map<String, Object> file =
                                                            (Map<String, Object>) values;

                                                    if (!file.containsKey("fileId")) {
                                                        continue;
                                                    }

                                                    Map<String, Object> fileInfo =
                                                            new HashMap<>();

                                                    fileInfo.put(
                                                            "responseId",
                                                            responseId
                                                    );

                                                    fileInfo.put(
                                                            "formId",
                                                            formId
                                                    );

                                                    fileInfo.put(
                                                            "fileId",
                                                            file.get("fileId")
                                                    );

                                                    fileInfo.put(
                                                            "fileName",
                                                            file.get("fileName")
                                                    );

                                                    fileInfo.put(
                                                            "size",
                                                            file.get("size")
                                                    );

                                                    // File1 / File 2
                                                    fileInfo.put(
                                                            "label",
                                                            label
                                                    );

                                                    result.add(
                                                            fileInfo
                                                    );
                                                }


                                                // =================================
                                                // Create file object
                                                // =================================

//                                                Map<String, Object>
//                                                        file =
//                                                        new HashMap<>();
//
//
//                                                file.put(
//                                                        "formId",
//                                                        formId
//                                                );
//
//                                                file.put(
//                                                        "fileId",
//                                                        fileData.get(
//                                                                "fileId"
//                                                        )
//                                                );
//
//                                                file.put(
//                                                        "fileName",
//                                                        fileData.get(
//                                                                "fileName"
//                                                        )
//                                                );
//
//                                                file.put(
//                                                        "contentType",
//                                                        fileData.get(
//                                                                "contentType"
//                                                        )
//                                                );
//
//                                                file.put(
//                                                        "size",
//                                                        fileData.get(
//                                                                "size"
//                                                        )
//                                                );
//
//                                                file.put(
//                                                        "label",
//                                                        column
//                                                );
//
//
//                                                result.add(
//                                                        file
//                                                );

//                                                System.out.println("Files successfully uploaded");


                                            } catch (
                                                    Exception ignored
                                            ) {

                                                // Not a file field
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                } catch (Exception e) {

                    e.printStackTrace();
                }
            }


            return ResponseEntity.ok(
                    result
            );


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            new ArrayList<>()
                    );
        }
    }

    @GetMapping("/files/{fileId}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String fileId
    ) {

        try {

            Path uploadDirectory =
                    Paths.get("uploads");


            // Find file beginning with fileId
            Path filePath =
                    Files.list(uploadDirectory)
                            .filter(path ->
                                    path.getFileName()
                                            .toString()
                                            .startsWith(
                                                    fileId
                                            )
                            )
                            .findFirst()
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "File not found"
                                    )
                            );


            Resource resource =
                    new UrlResource(
                            filePath
                                    .toUri()
                    );


            String contentType =
                    Files.probeContentType(
                            filePath
                    );


            if (contentType == null) {

                contentType =
                        "application/octet-stream";
            }


            return ResponseEntity.ok()

                    .contentType(
                            MediaType.parseMediaType(
                                    contentType
                            )
                    )

                    .body(resource);


        } catch (Exception e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    @GetMapping("/{formId}/responses")
    public List<FormResponse> getResponses(
            @PathVariable String formId) {

        return responseRepository
                .findByFormId(formId);
    }

    @PostMapping("/{id}/generate-link")
    public ResponseEntity<?> generateFormLink(
            @PathVariable String id,
            @RequestBody Map<String, String> request
    ) {

        try {

            formRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Form not found"
                            )
                    );

            String link = request.get("link");

            if (link == null || link.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Form link is required"
                        ));
            }

            String savedLink =
                    formLinkFileService.createLinkFile(
                            id,
                            link
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "id", id,
                            "link", savedLink
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to generate form link",
                            "error",
                            e.getMessage()
                    ));
        }
    }

    @GetMapping("/{id}/copy-link")
    public ResponseEntity<?> copyFormLink(
            @PathVariable String id
    ) {

        try {

            String link =
                    formLinkFileService
                            .readLinkFile(id);

            return ResponseEntity.ok(
                    Map.of(
                            "formId", id,
                            "link", link
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Form link file not found",
                            "error",
                            e.getMessage()
                    ));
        }
    }


}
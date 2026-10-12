package com.sampleproject.demoproject.Service;

import com.sampleproject.demoproject.Repository.FormDatabaseConfigRepository;
import com.sampleproject.demoproject.Repository.FormRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FormResponseService {

    private final FormRepository formRepository;

    private final FormDatabaseConfigRepository formDatabaseConfigRepository;


    public FormResponseService(
            FormRepository formRepository,
            FormDatabaseConfigRepository
                    formDatabaseConfigRepository
    ) {

        this.formRepository =
                formRepository;

        this.formDatabaseConfigRepository =
                formDatabaseConfigRepository;
    }

    public String saveFile(
            MultipartFile file
    ) throws IOException {


        // =========================================
        // UPLOAD DIRECTORY
        // =========================================

        Path uploadDirectory =
                Paths.get("uploads");


        Files.createDirectories(
                uploadDirectory
        );


        // =========================================
        // GENERATE UNIQUE FILE ID
        // =========================================

        String fileId =
                UUID.randomUUID()
                        .toString();


        // =========================================
        // GET ORIGINAL EXTENSION
        // =========================================

        String originalFileName =
                file.getOriginalFilename();


        String extension = "";


        if (
                originalFileName != null &&
                        originalFileName.contains(".")
        ) {

            extension =
                    originalFileName.substring(
                            originalFileName
                                    .lastIndexOf(".")
                    );
        }


        // =========================================
        // SERVER FILE NAME
        // =========================================

        String serverFileName =
                fileId + extension;


        Path filePath =
                uploadDirectory.resolve(
                        serverFileName
                );


        // =========================================
        // SAVE ACTUAL FILE
        // =========================================

        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );


        System.out.println(
                "File saved: "
                        + filePath
        );


        return fileId;
    }


    public String saveResponse(
            String formId,
            String answers,
            List<MultipartFile> files
    ) throws Exception {


        // =============================================
        // 1. CHECK FORM
        // =============================================

        formRepository
                .findById(formId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Form not found: "
                                        + formId
                        )
                );


        // =============================================
        // 2. SAVE FILES
        // =============================================

        List<String> fileIds =
                new ArrayList<>();


        if (files != null) {

            for (
                    MultipartFile file :
                    files
            ) {

                if (
                        file != null &&
                                !file.isEmpty()
                ) {

                    String fileId =
                            saveFile(file);

                    fileIds.add(
                            fileId
                    );
                }
            }
        }


        // =============================================
        // 3. SAVE RESPONSE
        // =============================================

        System.out.println(
                "FORM ID: "
                        + formId
        );

        System.out.println(
                "ANSWERS: "
                        + answers
        );

        System.out.println(
                "FILE IDS: "
                        + fileIds
        );


        /*
         * Here you can use your existing
         * MySQL/PostgreSQL/H2/MongoDB
         * response-saving logic.
         */


        return "Response saved successfully. "
                + "Files: "
                + fileIds.size();
    }
}

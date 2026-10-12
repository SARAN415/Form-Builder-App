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

        Path uploadDirectory =
                Paths.get("uploads");


        Files.createDirectories(
                uploadDirectory
        );

        String fileId =
                UUID.randomUUID()
                        .toString();


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

        String serverFileName =
                fileId + extension;


        Path filePath =
                uploadDirectory.resolve(
                        serverFileName
                );


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

        formRepository
                .findById(formId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Form not found: "
                                        + formId
                        )
                );


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


        return "Response saved successfully. "
                + "Files: "
                + fileIds.size();
    }
}

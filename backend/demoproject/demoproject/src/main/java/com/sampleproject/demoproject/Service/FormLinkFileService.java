package com.sampleproject.demoproject.Service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FormLinkFileService {

    private final Path formsFolder =
            Paths.get("uploads", "forms");

    private final String frontendUrl =
            "http://localhost:3000";

    // ============================================
    // CREATE LINK FILE
    // ============================================

    public String createLinkFile(
            String formId,
            String publicLink
    ) throws IOException {

        Files.createDirectories(formsFolder);

        Path filePath =
                formsFolder.resolve(formId + ".txt");

        Files.writeString(
                filePath,
                publicLink,
                StandardCharsets.UTF_8
        );

        return publicLink;
    }

    // ============================================
    // READ LINK FILE
    // ============================================

    public String readLinkFile(String formId)
            throws IOException {

        Path filePath =
                formsFolder.resolve(formId + ".txt");

        if (!Files.exists(filePath)) {
            throw new IOException(
                    "Link file not found for form: "
                            + formId
            );
        }

        return Files.readString(
                filePath,
                StandardCharsets.UTF_8
        ).trim();
    }
}
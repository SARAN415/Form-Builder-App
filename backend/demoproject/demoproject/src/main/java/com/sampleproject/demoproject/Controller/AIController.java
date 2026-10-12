package com.sampleproject.demoproject.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sampleproject.demoproject.Model.AICommandRequest;
import com.sampleproject.demoproject.Model.AIControlResponse;
import com.sampleproject.demoproject.Service.FormAIService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {

    private final FormAIService formAIService;

    public AIController(FormAIService formAIService) {
        this.formAIService = formAIService;
    }

    @PostMapping("/control")
    public ResponseEntity<?> generateControl(
            @RequestBody AICommandRequest request) {

        try {

            if (request == null ||
                    request.getPrompt() == null ||
                    request.getPrompt().isBlank()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "Prompt is required."
                        ));
            }

            AIControlResponse result =
                    formAIService.generateControl(
                            request.getPrompt().trim()
                    );

            if (result == null) {

                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "message",
                                "AI returned an empty response."
                        ));
            }

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "result", result
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "AI control generation failed."
                    ));
        }
    }
}
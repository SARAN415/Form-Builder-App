package com.sampleproject.demoproject.Controller;

import com.sampleproject.demoproject.Model.Form;
import com.sampleproject.demoproject.Repository.FormRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public-forms")
public class PublicFormController{

    private final FormRepository repository;

    public PublicFormController(
            FormRepository repository) {

        this.repository = repository;
    }

    @GetMapping("/{token}")
    public ResponseEntity<?> getPublicForm(
            @PathVariable String token) {

        Form form =
                repository
                        .findByPublicToken(token)
                        .orElse(null);

        if (form == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                Map.of(
                        "token", form.getPublicToken(),
                        "formData", form.getFormData()
                )
        );
    }
}



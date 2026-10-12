package com.sampleproject.demoproject.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "form")
public class Form {

    @Id
    private String id;

//    @Column(name = "name")
//    private String name;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "public_token", unique = true, nullable = false)
    private String publicToken;

    @Column(name = "form_data", columnDefinition = "JSON")
    private String formData;

    public Form() {
    }

    public Form(String id) {
        this.id = id;
        this.createdAt = LocalDateTime.now();
    }

    public void setFormData(String formData) {
        this.formData = formData;
    }

    public String getFormData() {
        return formData;
    }

    public String getPublicToken() {
        return publicToken;
    }

    public void setPublicToken(String publicToken) {
        this.publicToken = publicToken;
    }

    public String getId() {

        return id;

    }

    public void setId(String id) {

        this.id = id;

    }

    public LocalDateTime getCreatedAt() {

        return createdAt;

    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {

        this.createdAt =
                createdAt;

    }
}
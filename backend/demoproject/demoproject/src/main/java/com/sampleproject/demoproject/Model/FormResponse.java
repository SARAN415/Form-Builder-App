package com.sampleproject.demoproject.Model;

import jakarta.persistence.*;

@Entity
public class FormResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String formId;

    @Lob
    private String answers;

    public FormResponse() {
    }

    public FormResponse(String formId, String answers) {
        this.formId = formId;
        this.answers = answers;
    }

    public Long getId() {
        return id;
    }

    public String getFormId() {
        return formId;
    }

    public void setFormId(String formId) {
        this.formId = formId;
    }

    public String getAnswers() {
        return answers;
    }

    public void setAnswers(String answers) {
        this.answers = answers;
    }
}
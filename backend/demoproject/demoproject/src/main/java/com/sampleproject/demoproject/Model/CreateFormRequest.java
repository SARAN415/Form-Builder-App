package com.sampleproject.demoproject.Model;

public class CreateFormRequest {

    private String formData;

    private DatabaseConfig database;

    public DatabaseConfig getDatabase() {
        return database;
    }

    public void setDatabase(
            DatabaseConfig database
    ) {
        this.database = database;
    }

    public String getFormData() {
        return formData;
    }

    public void setFormData(String formData) {
        this.formData = formData;
    }
}
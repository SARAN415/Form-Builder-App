package com.sampleproject.demoproject.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
//import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Table;
//import jakarta.persistence.GenerationType;

@Entity
@Table(name = "form_database_config")
public class FormDatabaseConfig {

    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @Column(name = "form_id", nullable = false)
    private String formId;

    @Column(name = "database_type")
    private String databaseType;

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "driver_class_name", nullable = false)
    private String driverClassName;

    @Column(name = "database_name")
    private String databaseName;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "password")
    private String password;


    public FormDatabaseConfig() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFormId() {
        return formId;
    }

    public void setFormId(String formId) {
        this.formId = formId;
    }

    public String getDatabaseType() {
        return databaseType;
    }

    public void setDatabaseType(
            String databaseType
    ) {
        this.databaseType = databaseType;
    }


    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }


    public String getDriverClassName() {
        return driverClassName;
    }

    public void setDriverClassName(
            String driverClassName
    ) {
        this.driverClassName =
                driverClassName;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(
            String databaseName
    ) {
        this.databaseName = databaseName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }


    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
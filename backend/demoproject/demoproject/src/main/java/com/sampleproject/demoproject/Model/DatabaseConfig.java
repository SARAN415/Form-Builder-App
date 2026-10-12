package com.sampleproject.demoproject.Model;

public class DatabaseConfig {

    private String databaseType;

    private String url;

    private String driverClassName;

    private String databaseName;

    private String username;

    private String password;


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

    public String getDatabaseType() {
        return databaseType;
    }

    public void setDatabaseType(
            String databaseType
    ) {
        this.databaseType = databaseType;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(
            String databaseName
    ) {
        this.databaseName = databaseName;
    }

}
package com.sampleproject.demoproject.Service;

import com.sampleproject.demoproject.Model.FormDatabaseConfig;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import org.bson.Document;

import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;

@Service
public class DatabaseService {

    public void testConnection(
            FormDatabaseConfig config
    ) throws Exception {

        if (config == null) {

            throw new RuntimeException(
                    "Database configuration is required"
            );
        }


        String databaseType =
                config.getDatabaseType();


        if (
                databaseType == null ||
                        databaseType.isBlank()
        ) {

            throw new RuntimeException(
                    "Database type is required"
            );
        }

        if (
                databaseType.equalsIgnoreCase(
                        "MONGODB"
                )
        ) {

            testMongoDB(config);

            return;
        }

        testSqlDatabase(config);
    }

    private void testSqlDatabase(
            FormDatabaseConfig config
    ) throws Exception {

        if (
                config.getUrl() == null ||
                        config.getUrl().isBlank()
        ) {

            throw new RuntimeException(
                    "Database URL is required"
            );
        }


        if (
                config.getDriverClassName() == null ||
                        config.getDriverClassName().isBlank()
        ) {

            throw new RuntimeException(
                    "Driver class name is required"
            );
        }


        // Load driver

        Class.forName(
                config.getDriverClassName()
        );


        // Try connection

        try (
                Connection connection =
                        DriverManager.getConnection(
                                config.getUrl(),
                                config.getUsername(),
                                config.getPassword()
                        )
        ) {

            if (
                    !connection.isValid(5)
            ) {

                throw new RuntimeException(
                        "Database connection is not valid"
                );
            }


            System.out.println(
                    "SQL database connection successful"
            );
        }
    }

    private void testMongoDB(
            FormDatabaseConfig config
    ) {

        if (
                config.getUrl() == null ||
                        config.getUrl().isBlank()
        ) {

            throw new RuntimeException(
                    "MongoDB connection URL is required"
            );
        }


        if (
                config.getDatabaseName() == null ||
                        config.getDatabaseName().isBlank()
        ) {

            throw new RuntimeException(
                    "MongoDB database name is required"
            );
        }


        try (
                MongoClient mongoClient =
                        MongoClients.create(
                                config.getUrl()
                        )
        ) {

            mongoClient
                    .getDatabase(
                            config.getDatabaseName()
                    )
                    .runCommand(
                            new Document(
                                    "ping",
                                    1
                            )
                    );


            System.out.println(
                    "MongoDB connection successful"
            );
        }
    }
}
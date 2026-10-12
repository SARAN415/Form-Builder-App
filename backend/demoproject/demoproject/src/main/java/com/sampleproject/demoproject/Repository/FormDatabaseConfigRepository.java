package com.sampleproject.demoproject.Repository;

import com.sampleproject.demoproject.Model.FormDatabaseConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FormDatabaseConfigRepository
        extends JpaRepository<FormDatabaseConfig, Long> {

    Optional<FormDatabaseConfig>
    findByFormId(String formId);

    void deleteByFormId(
            String formId
    );
}
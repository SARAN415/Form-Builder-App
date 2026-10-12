package com.sampleproject.demoproject.Repository;

import com.sampleproject.demoproject.Model.FormResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormResponseRepository
        extends JpaRepository<FormResponse, Long> {

    List<FormResponse> findByFormId(String formId);
}
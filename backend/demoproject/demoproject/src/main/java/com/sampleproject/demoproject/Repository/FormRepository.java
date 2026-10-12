package com.sampleproject.demoproject.Repository;

import com.sampleproject.demoproject.Model.Form;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FormRepository extends JpaRepository<Form, String> {
    //List<Form> findAllByOrderByUpdatedAtDesc();
    Optional<Form> findByPublicToken(String publicToken);
}
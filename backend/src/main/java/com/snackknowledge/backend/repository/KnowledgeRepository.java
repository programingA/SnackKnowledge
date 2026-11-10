package com.snackknowledge.backend.repository;

import com.snackknowledge.backend.entity.Knowledge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeRepository extends JpaRepository<Knowledge, Long> {

}

package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.Department;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepo extends JpaRepository<Department, Long> {


    Optional<Department> findByDepartmentName( String departmentName);
}


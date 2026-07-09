package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepo extends JpaRepository<Department, Long> {


}


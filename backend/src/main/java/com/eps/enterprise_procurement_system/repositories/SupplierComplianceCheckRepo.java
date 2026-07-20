package com.eps.enterprise_procurement_system.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.SupplierComplianceCheck;

public interface SupplierComplianceCheckRepo extends JpaRepository<SupplierComplianceCheck, Long> {
    
}

package com.eps.enterprise_procurement_system.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.SupplierDocument;

public interface SupplierDocumentRepo extends JpaRepository<SupplierDocument, Long> {
    
}
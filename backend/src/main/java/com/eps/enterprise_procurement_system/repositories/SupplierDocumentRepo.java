package com.eps.enterprise_procurement_system.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.SupplierDocument;
import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;

public interface SupplierDocumentRepo extends JpaRepository<SupplierDocument, Long> {
    List<SupplierDocument> findBySupplier_Id(Long supplierId);

    List<SupplierDocument> findByStatusAndVerifiedAtBefore(VerificationStatus status, LocalDateTime date);

}
package com.eps.enterprise_procurement_system.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.SupplierPerformance;

public interface SupplierPerformanceRepo extends JpaRepository<SupplierPerformance, Long> {
    List<SupplierPerformance> findBySupplier_Id(Long supplierId);

    Optional<SupplierPerformance> findBySupplier_IdAndPurchaseOrder_IdAndReviewedBy_Id(
            Long supplierId, Long purchaseOrderId, Long reviewedById
    );

    Long countBySupplier_Id(Long sup_id);
}

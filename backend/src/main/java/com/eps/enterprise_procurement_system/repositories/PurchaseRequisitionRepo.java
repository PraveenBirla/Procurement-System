package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRequisitionRepo extends JpaRepository<PurchaseRequisition, Long> {
    List<PurchaseRequisition> findByStatus(String status);

    List<PurchaseRequisition> findByEmployee_Id(Long employeeId);
}

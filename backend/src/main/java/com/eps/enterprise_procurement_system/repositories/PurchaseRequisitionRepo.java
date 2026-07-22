package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRequisitionRepo extends JpaRepository<PurchaseRequisition, Long> {
    List<PurchaseRequisition> findByStatus(String status);

    List<PurchaseRequisition> findByEmployee_Id(Long employeeId);

    PurchaseRequisition findByRequisitionNo(String requisitionNo);

    List<PurchaseRequisition> findByStatus(RequisitionStatus status);

    List<PurchaseRequisition> findByEmployee_Department_Id(Long departmentId);

    List<PurchaseRequisition> findByEmployee_Department_IdAndStatus(
            Long departmentId,
            RequisitionStatus status
    );

    List<PurchaseRequisition> findByStatusOrderByCreatedAtDesc(
            RequisitionStatus status
    );

    List<PurchaseRequisition> findAllByOrderByCreatedAtDesc();

    void deleteById(Long id);
}

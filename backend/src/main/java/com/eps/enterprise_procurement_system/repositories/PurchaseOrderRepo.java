package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.PurchaseOrder;
import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepo extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    Optional<PurchaseOrder> findByRequisition_Id(Long requisitionId);

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);

    boolean existsByRequisition_Id(Long requisition_id);

    List<PurchaseOrder> findBySupplier_Id(Long supplierId);

    List<PurchaseOrder> findByGeneratedBy_Id(Long userId);

    List<PurchaseOrder> findBySupplier_CompanyNameContainingIgnoreCase(String keyword);

    List<PurchaseOrder> findByExpectedDeliveryDateBefore(LocalDate date);

    List<PurchaseOrder> findByStatusAndSupplier_Id(PurchaseOrderStatus status, Long supplierId);
}

package com.eps.enterprise_procurement_system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.Approval;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.enums.ApprovalType;

public interface ApprovalRepo extends JpaRepository<Approval, Long> {
    List<Approval> findByRequisition_Id(Long id);

    boolean existsByRequisitionAndApprovalType(PurchaseRequisition pr, ApprovalType type);
}

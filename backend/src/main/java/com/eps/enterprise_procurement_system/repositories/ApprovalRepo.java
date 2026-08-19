package com.eps.enterprise_procurement_system.repositories;

import java.util.List;
import java.util.Optional;

import com.eps.enterprise_procurement_system.entities.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.Approval;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.enums.ApprovalType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApprovalRepo extends JpaRepository<Approval, Long> {
    List<Approval> findByRequisition_Id(Long id);

    Optional<Approval> findFirstByRequisition_IdAndApprover_IdOrderByDecidedAtDesc(Long req_id, Long user_id);

    boolean existsByRequisitionAndApprovalTypeAndStatusIn(
        PurchaseRequisition requisition,
        ApprovalType approvalType,
        List<ApprovalStatus> statuses
    );

    @Query("""
 SELECT a.requisition
FROM Approval a
WHERE a.approvalType = :approvalType
AND a.status = :status
""")
    List<PurchaseRequisition> findRequisitionsByApprovalTypeAndStatus(
            @Param("approvalType") ApprovalType approvalType,
            @Param("status") ApprovalStatus status);

    @Query("""
    SELECT a.requisition
    FROM Approval a
    WHERE a.approvalType = :approvalType
      AND a.status = :status
      AND a.requisition.employee.department.id = :departmentId
""")
    List<PurchaseRequisition> findRequisitionsByApprovalTypeAndStatusAndDepartment(
            @Param("approvalType") ApprovalType approvalType,
            @Param("status") ApprovalStatus status,
            @Param("departmentId") Long departmentId
    );
}

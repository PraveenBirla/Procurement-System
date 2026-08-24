package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.Department;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionPriority;

import java.time.LocalDateTime;
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

    long countByEmployee_Department_IdAndStatusAndPriority(Long departmentId, RequisitionStatus status, RequisitionPriority priority);

    List<PurchaseRequisition> findByEmployee_Department_IdAndStatusAndPriorityOrderByCreatedAtDesc(Long departmentId, RequisitionStatus status, RequisitionPriority priority);

    long countByStatusAndPriority(RequisitionStatus status, RequisitionPriority priority);

    List<PurchaseRequisition> findByStatusOrderByCreatedAtDesc(
            RequisitionStatus status
    );

    List<PurchaseRequisition> findAllByOrderByCreatedAtDesc();

    List<PurchaseRequisition> findByEmployeeAndCreatedAtAfterAndStatusNotIn(
        User employee, LocalDateTime since, List<RequisitionStatus> excludedStatuses);

    List<PurchaseRequisition> findByEmployee_DepartmentAndCreatedAtAfterAndStatusNotIn(
        Department department, LocalDateTime since, List<RequisitionStatus> excludedStatuses);

    void deleteById(Long id);
}

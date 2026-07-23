package com.eps.enterprise_procurement_system.services;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.eps.enterprise_procurement_system.dto.RequisitionItemRequestDTO;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.RequisitionItem;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import com.eps.enterprise_procurement_system.repositories.PurchaseRequisitionRepo;
import com.eps.enterprise_procurement_system.repositories.RequisitionItemRepo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DuplicateCheckService {

    private static final int LOOKBACK_DAYS = 14;
    private static final double OVERLAP_THRESHOLD = 0.5; // 50% of the OLD requisition's products shared

    private static final List<RequisitionStatus> INACTIVE_STATUSES = List.of(
            RequisitionStatus.MANAGER_REJECTED,
            RequisitionStatus.FINANCE_REJECTED,
            RequisitionStatus.ADMIN_REJECTED,
            RequisitionStatus.CANCELLED
    );

    private final PurchaseRequisitionRepo reqRepo;
    private final RequisitionItemRepo itemRepo;

    @Getter
    @AllArgsConstructor
    public static class Result {
        private final boolean duplicate;
        private final PurchaseRequisition matched;  // the requisition it collided with, or null
        private final boolean sameEmployee;          // true = same person re-requesting
    }

    /**
     * Checks the new request against the employee's own recent requisitions first
     * (same-employee duplicate), then against the rest of the department
     * (different-employee duplicate) if no self-match is found.
     */
    public Result check(User employee, List<RequisitionItemRequestDTO> requestedItems) {
        Set<Long> requestedProductIds = toProductIdSet(requestedItems);
        LocalDateTime since = LocalDateTime.now().minusDays(LOOKBACK_DAYS);

        // 1) SAME EMPLOYEE check
        List<PurchaseRequisition> ownRecent = reqRepo
                .findByEmployeeAndCreatedAtAfterAndStatusNotIn(employee, since, INACTIVE_STATUSES);

        PurchaseRequisition ownMatch = findOverlap(requestedProductIds, ownRecent);
        if (ownMatch != null) {
            return new Result(true, ownMatch, true);
        }

        // 2) DIFFERENT EMPLOYEE (same department) check
        List<PurchaseRequisition> deptRecent = reqRepo
                .findByEmployee_DepartmentAndCreatedAtAfterAndStatusNotIn(
                        employee.getDepartment(), since, INACTIVE_STATUSES);

        // exclude the employee's own requisitions — already checked above
        deptRecent.removeIf(r -> r.getEmployee().getId().equals(employee.getId()));

        PurchaseRequisition otherMatch = findOverlap(requestedProductIds, deptRecent);
        if (otherMatch != null) {
            return new Result(true, otherMatch, false);
        }

        return new Result(false, null, false);
    }

    private Set<Long> toProductIdSet(List<RequisitionItemRequestDTO> items) {
        Set<Long> ids = new HashSet<>();
        for (RequisitionItemRequestDTO i : items) ids.add(i.getProductId());
        return ids;
    }

    private PurchaseRequisition findOverlap(Set<Long> requestedProductIds, List<PurchaseRequisition> candidates) {
        for (PurchaseRequisition candidate : candidates) {
            Set<Long> candidateProductIds = new HashSet<>();
            for (RequisitionItem ri : itemRepo.findByRequisition_Id(candidate.getId())) {
                candidateProductIds.add(ri.getProduct().getId());
            }
            if (candidateProductIds.isEmpty()) continue;

            Set<Long> intersection = new HashSet<>(requestedProductIds);
            intersection.retainAll(candidateProductIds);

            double overlap = (double) intersection.size() / candidateProductIds.size();
            if (overlap >= OVERLAP_THRESHOLD) {
                return candidate;
            }
        }
        return null;
    }
}
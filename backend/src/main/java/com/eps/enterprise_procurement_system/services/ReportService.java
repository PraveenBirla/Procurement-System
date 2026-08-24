package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.report.SpendingReportDTO;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import com.eps.enterprise_procurement_system.repositories.PurchaseRequisitionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final PurchaseRequisitionRepo requisitionRepository;

    @Autowired
    public ReportService(PurchaseRequisitionRepo requisitionRepository) {
        this.requisitionRepository = requisitionRepository;
    }

    public SpendingReportDTO getSpendingReport() {
        List<PurchaseRequisition> allReqs = requisitionRepository.findAll();

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal approved = BigDecimal.ZERO;
        BigDecimal pending = BigDecimal.ZERO;
        BigDecimal rejected = BigDecimal.ZERO;
        BigDecimal completed = BigDecimal.ZERO;

        for (PurchaseRequisition req : allReqs) {
            BigDecimal amount = req.getTotalEstimatedAmount() != null ? req.getTotalEstimatedAmount() : BigDecimal.ZERO;
            total = total.add(amount);

            if (req.getStatus() == RequisitionStatus.APPROVED) {
                approved = approved.add(amount);
            } else if (isPending(req.getStatus())) {
                pending = pending.add(amount);
            } else if (isRejected(req.getStatus())) {
                rejected = rejected.add(amount);
            }
            if (req.getStatus() == RequisitionStatus.COMPLETED) {
                completed = completed.add(amount);
            }
        }

        Map<String, List<PurchaseRequisition>> byDept = allReqs.stream()
                .filter(r -> r.getEmployee() != null && r.getEmployee().getDepartment() != null)
                .collect(Collectors.groupingBy(r -> r.getEmployee().getDepartment().getDepartmentName()));

        List<SpendingReportDTO.DepartmentSpending> deptSpending = new ArrayList<>();
        for (Map.Entry<String, List<PurchaseRequisition>> entry : byDept.entrySet()) {
            BigDecimal deptApproved = BigDecimal.ZERO;
            BigDecimal deptPending = BigDecimal.ZERO;
            BigDecimal deptRejected = BigDecimal.ZERO;

            for (PurchaseRequisition r : entry.getValue()) {
                BigDecimal amount = r.getTotalEstimatedAmount() != null ? r.getTotalEstimatedAmount() : BigDecimal.ZERO;
                if (r.getStatus() == RequisitionStatus.APPROVED) deptApproved = deptApproved.add(amount);
                else if (isPending(r.getStatus())) deptPending = deptPending.add(amount);
                else if (isRejected(r.getStatus())) deptRejected = deptRejected.add(amount);
            }
            deptSpending.add(new SpendingReportDTO.DepartmentSpending(entry.getKey(), deptApproved, deptPending, deptRejected));
        }

        return new SpendingReportDTO(
                new SpendingReportDTO.Summary(total, approved, pending, rejected, completed),
                deptSpending
        );
    }
    
    private boolean isPending(RequisitionStatus status) {
        return status == RequisitionStatus.PENDING_MANAGER || status == RequisitionStatus.PENDING_FINANCE || status == RequisitionStatus.PENDING_ADMIN || status == RequisitionStatus.PENDING_PROCUREMENT;
    }
    
    private boolean isRejected(RequisitionStatus status) {
        return status == RequisitionStatus.MANAGER_REJECTED || status == RequisitionStatus.FINANCE_REJECTED || status == RequisitionStatus.PROCUREMENT_REJECTED || status == RequisitionStatus.ADMIN_REJECTED;
    }
}

package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.SpendingReportResponseDTO;
import com.eps.enterprise_procurement_system.entities.PurchaseOrder;
import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;
import com.eps.enterprise_procurement_system.repositories.PurchaseOrderRepo;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final PurchaseOrderRepo purchaseOrderRepo;

    @Transactional(readOnly = true)
    public SpendingReportResponseDTO getSpendingReport() {

        List<PurchaseOrder> purchaseOrders =
                purchaseOrderRepo.findAll();

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal approved = BigDecimal.ZERO;
        BigDecimal pending = BigDecimal.ZERO;
        BigDecimal rejected = BigDecimal.ZERO;
        BigDecimal completed = BigDecimal.ZERO;

        Map<String, SpendingReportResponseDTO.DepartmentSpending>
                departmentMap = new LinkedHashMap<>();

        for (PurchaseOrder po : purchaseOrders) {

            BigDecimal amount =
                    po.getTotalAmount() != null
                            ? po.getTotalAmount()
                            : BigDecimal.ZERO;

            total = total.add(amount);

            PurchaseOrderStatus status = po.getStatus();

            String departmentName =
                    po.getRequisition() != null &&
                    po.getRequisition().getEmployee().getDepartment() != null
                            ? po.getRequisition()
                                .getEmployee().getDepartment()
                                .getDepartmentName()
                            : "Unknown";

            SpendingReportResponseDTO.DepartmentSpending department =
                    departmentMap.computeIfAbsent(
                            departmentName,
                            name -> new SpendingReportResponseDTO
                                    .DepartmentSpending(
                                            name,
                                            BigDecimal.ZERO,
                                            BigDecimal.ZERO,
                                            BigDecimal.ZERO
                                    )
                    );

            if (status == null) {
                continue;
            }

            switch (status) {

                /*
                 * Completed procurement
                 */
                case COMPLETED -> {

                    completed = completed.add(amount);

                    approved = approved.add(amount);

                    department.setApproved(
                            department.getApproved().add(amount)
                    );
                }

                /*
                 * Approved / active procurement states
                 */
                case PO_GENERATED,
                     GENERATED,
                     SENT_TO_SUPPLIER,
                     PO_RECEIVED,
                     IN_DELIVERY,
                     DELIVERED,
                     RETURN_INITIATED,
                     REPLACEMENT_PENDING,
                     REPLACEMENT_RECEIVED,
                     PARTIALLY_RECEIVED,
                     PROCUREMENT_ACCEPTED -> {

                    approved = approved.add(amount);

                    department.setApproved(
                            department.getApproved().add(amount)
                    );
                }

                case CANCELLED -> {

                    rejected = rejected.add(amount);

                    department.setRejected(
                            department.getRejected().add(amount)
                    );
                }

                default -> {

                    pending = pending.add(amount);

                    department.setPending(
                            department.getPending().add(amount)
                    );
                }
            }
        }

        pending = total
                .subtract(approved)
                .subtract(rejected);

        SpendingReportResponseDTO.Summary summary =
                new SpendingReportResponseDTO.Summary(
                        total,
                        approved,
                        pending,
                        rejected,
                        completed
                );

        return new SpendingReportResponseDTO(
                summary,
                new ArrayList<>(departmentMap.values())
        );
    }
}
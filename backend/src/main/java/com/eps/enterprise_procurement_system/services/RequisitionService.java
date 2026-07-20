package com.eps.enterprise_procurement_system.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.eps.enterprise_procurement_system.dto.RequisitionDTO.CreateRequest;
import com.eps.enterprise_procurement_system.dto.RequisitionDTO.DecisionRequest;
import com.eps.enterprise_procurement_system.dto.RequisitionDTO.Item;
import com.eps.enterprise_procurement_system.entities.Approval;
import com.eps.enterprise_procurement_system.entities.Product;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.RequisitionItem;
import com.eps.enterprise_procurement_system.entities.RequisitionStatusHistory;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.ApprovalStatus;
import com.eps.enterprise_procurement_system.entities.enums.ApprovalType;
import com.eps.enterprise_procurement_system.entities.enums.NotificationType;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import com.eps.enterprise_procurement_system.entities.enums.Role;
import com.eps.enterprise_procurement_system.repositories.ApprovalRepo;
import com.eps.enterprise_procurement_system.repositories.ProductRepo;
import com.eps.enterprise_procurement_system.repositories.PurchaseRequisitionRepo;
import com.eps.enterprise_procurement_system.repositories.RequisitionItemRepo;
import com.eps.enterprise_procurement_system.repositories.RequisitionStatusHistoryRepo;
import com.eps.enterprise_procurement_system.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RequisitionService {

    private final PurchaseRequisitionRepo reqRepo;
    private final PurchaseRequisitionService purchaseRequisitionService;
    private final RequisitionItemRepo itemRepo;
    private final RequisitionStatusHistoryRepo historyRepo;
    private final ApprovalRepo approvalRepo;
    private final ProductRepo productRepo;
    private final UserRepository userRepo;
    private final NotificationService notify;
    private final AuditService audit;

    @Transactional
    public PurchaseRequisition create(CreateRequest req, User employee) {

        BigDecimal total = req.items.stream()
                .map(i -> i.unitPrice.multiply(BigDecimal.valueOf(i.quantity)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PurchaseRequisition purchaseRequisition = PurchaseRequisition.builder()
                .requisitionNo("REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()).employee(employee)
                .title(req.title).description(req.description).totalEstimatedAmount(total)
                .status(RequisitionStatus.PENDING_MANAGER).isDuplicate(false).build();

        PurchaseRequisition pr = purchaseRequisitionService.createRequisition(purchaseRequisition);

        for (Item i : req.items) {
            Product p = productRepo.findById(i.productId).orElseThrow();
            itemRepo.save(RequisitionItem.builder()
                    .requisition(pr).product(p).quantity(i.quantity).unitPrice(i.unitPrice).build());
        }

        historyRepo.save(RequisitionStatusHistory.builder()
                .requisition(pr).oldStatus(RequisitionStatus.DRAFT).newStatus(RequisitionStatus.PENDING_MANAGER)
                .changedBy(employee).remarks("Submitted for manager approval").build());

        // Notify managers
        userRepo.findByDepartmentAndRole(employee.getDepartment(), Role.MANAGER).forEach(m ->
        notify.notify(m, pr, null, NotificationType.APPROVAL, "New requisition " + pr.getRequisitionNo() + " needs your approval"));
                
        audit.log("PurchaseRequisition", pr.getId(), "CREATE", employee, "Requisition created");
        return pr;
    }

    @Transactional
    public PurchaseRequisition decide(Long id, String approvalType, DecisionRequest dec, User approver) {
        PurchaseRequisition pr = reqRepo.findById(id).orElseThrow();
        RequisitionStatus old = pr.getStatus();
        boolean approved = "approved".equalsIgnoreCase(dec.decision);
        String next;
        if (!approved) {
            next = approvalType + "_rejected";
        } else {
            switch (approvalType) {
                case "manager" -> next = "pending_finance";
                case "finance" -> next = "pending_admin";
                case "higher_authority" -> next = "approved";
                default -> throw new IllegalArgumentException("Unknown approval type");
            }
        }
        pr.setStatus(RequisitionStatus.valueOf(next));
        pr.setUpdatedAt(LocalDateTime.now());
        reqRepo.save(pr);
        approvalRepo.save(Approval.builder()
                .requisition(pr).approver(approver).approvalType(ApprovalType.valueOf(approvalType))
                .status(approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED).remarks(dec.remarks)
                .decidedAt(LocalDateTime.now()).build());
        historyRepo.save(RequisitionStatusHistory.builder()
                .requisition(pr).oldStatus(old).newStatus(RequisitionStatus.valueOf(next)).changedBy(approver).remarks(dec.remarks).build());
        notify.notify(pr.getEmployee(), pr, null, approved ? NotificationType.APPROVAL : NotificationType.REJECTION,
                "Requisition " + pr.getRequisitionNo() + ": " + next);
        // Notify next role
        Role nextRole = switch (next) {
            case "pending_finance" -> Role.FINANCE;
            case "pending_admin" -> Role.ADMIN;
            case "approved" -> Role.PROCUREMENT;
            default -> null;
        };
        if (nextRole != null) userRepo.findByRole(nextRole).forEach(u ->
                notify.notify(u, pr, null, NotificationType.APPROVAL, NotificationType.REJECTION + pr.getRequisitionNo() + " awaits your action"));
        audit.log("PurchaseRequisition", pr.getId(), "DECIDE_" + approvalType.toUpperCase(), approver, dec.remarks);
        return pr;
    }

    public List<PurchaseRequisition> findAll() {
        return reqRepo.findAll();
    }

    public List<PurchaseRequisition> findByStatus(String s) {
        return reqRepo.findByStatus(s);
    }

    public List<PurchaseRequisition> findByEmployee(Long id) {
        return reqRepo.findByEmployee_Id(id);
    }

    public PurchaseRequisition findById(Long id) {
        return reqRepo.findById(id).orElseThrow();
    }

    public List<RequisitionItem> itemsOf(Long id) {
        return itemRepo.findByRequisition_Id(id);
    }

}


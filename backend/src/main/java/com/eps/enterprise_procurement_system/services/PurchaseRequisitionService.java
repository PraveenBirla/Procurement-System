package com.eps.enterprise_procurement_system.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.eps.enterprise_procurement_system.dto.DecisionRequestDTO;
import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionRequestDTO;
import com.eps.enterprise_procurement_system.dto.RequisitionItemResponseDTO;
import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionResponseDTO;
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
import com.eps.enterprise_procurement_system.repositories.RequisitionStatusHistoryRepo;
import com.eps.enterprise_procurement_system.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PurchaseRequisitionService {

    private final PurchaseRequisitionRepo reqRepo;
    private final RequisitionItemService itemService;
    private final RequisitionStatusHistoryRepo historyRepo;
    private final ApprovalRepo approvalRepo;
    private final ProductRepo productRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final ModelMapper modelMapper;
    private final DuplicateCheckService duplicateCheckService;

    public PurchaseRequisitionResponseDTO mapToDto(PurchaseRequisition saved) {
        PurchaseRequisitionResponseDTO response = modelMapper.map(saved, PurchaseRequisitionResponseDTO.class);

        response.setEmployeeName(saved.getEmployee().getFullName());

        response.setDepartmentName(
                saved.getEmployee()
                    .getDepartment()
                    .getDepartmentName()
        );

        response.setItems(
                saved.getItems()
                    .stream()
                    .map(item -> {

                        RequisitionItemResponseDTO dto = new RequisitionItemResponseDTO();

                        dto.setId(item.getId());
                        dto.setProductId(item.getProduct().getId());
                        dto.setProductName(item.getProduct().getName());
                        dto.setQuantity(item.getQuantity());
                        dto.setUnitPrice(item.getUnitPrice());

                        return dto;
                    })
                    .toList()
        );

        return response;
    }

    private RequisitionStatus getNextStatus(ApprovalType approvalType, boolean approved) {

        if (!approved) {
            return switch (approvalType) {
                case MANAGER -> RequisitionStatus.MANAGER_REJECTED;
                case FINANCE -> RequisitionStatus.FINANCE_REJECTED;
                case HIGHER_AUTHORITY -> RequisitionStatus.ADMIN_REJECTED;
            };
        }

        return switch (approvalType) {
            case MANAGER -> RequisitionStatus.PENDING_FINANCE;
            case FINANCE -> RequisitionStatus.PENDING_ADMIN;
            case HIGHER_AUTHORITY -> RequisitionStatus.APPROVED;
        };
    }

    private void notifyNextApprover(PurchaseRequisition requisition, RequisitionStatus status){

        Role role = switch (status){
            case PENDING_FINANCE -> Role.FINANCE;
            case PENDING_ADMIN -> Role.ADMIN;
            case APPROVED -> Role.PROCUREMENT;
            default -> null;
        };

        if(role==null)
            return;

        userRepo.findByRole(role)
                .forEach(user ->
                    notificationService.notify(
                            user,
                            requisition,
                            null,
                            NotificationType.APPROVAL,
                            requisition.getRequisitionNo()+"\nStatus: "+requisition.getStatus()+"\nApproval Type: "+requisition.getApprovals()
                    )
                );
    }


    @Transactional
    public PurchaseRequisitionResponseDTO createRequisition(PurchaseRequisitionRequestDTO dto, User employee) {

        DuplicateCheckService.Result dup = duplicateCheckService.check(employee, dto.getItems());

        PurchaseRequisition requisition = PurchaseRequisition.builder()
                .requisitionNo("REQ-" + UUID.randomUUID().toString().replace("-", "").toUpperCase().substring(0, 8))
                .employee(employee)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(RequisitionStatus.PENDING_MANAGER)
                .isDuplicate(dup.isDuplicate())
                .build();


        BigDecimal total = BigDecimal.ZERO;

        for (var itemDTO : dto.getItems()) {

            Product product = productRepo.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found"));

            RequisitionItem item = RequisitionItem.builder()
                    .requisition(requisition)
                    .product(product)
                    .quantity(itemDTO.getQuantity())
                    .unitPrice(itemDTO.getUnitPrice())
                    .build();

            requisition.getItems().add(item);

            total = total.add(
                    item.getUnitPrice().multiply(
                            BigDecimal.valueOf(item.getQuantity())));
        }

        requisition.setTotalEstimatedAmount(total);

        PurchaseRequisition saved = reqRepo.save(requisition);

        historyRepo.save(RequisitionStatusHistory.builder().requisition(saved)
                .oldStatus(RequisitionStatus.DRAFT)
                .newStatus(RequisitionStatus.PENDING_MANAGER).changedBy(employee).remarks("Submitted").build());

        userRepo.findByDepartmentAndRole(employee.getDepartment(), Role.MANAGER)
            .forEach(manager -> notificationService.notify(
                            manager,
                            saved,
                            null,
                            NotificationType.APPROVAL,
                            "New Requisition Waiting"
                        )
                );
        
        

        auditService.log("PurchaseRequisition", saved.getId(), "CREATE", employee, "Requisition Created");

        return mapToDto(saved);
    }

    @Transactional
    public PurchaseRequisitionResponseDTO decideRequisition(Long requisitionId, ApprovalType approvalType,DecisionRequestDTO dto, User approver
    ) {

        PurchaseRequisition requisition =
                reqRepo.findById(requisitionId)
                        .orElseThrow(() -> 
                        new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                "Requisition not found"));

        // Employee cannot approve own request
        if (requisition.getEmployee().getId().equals(approver.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You cannot approve your own requisition");
        }
        
        // Already completed
        if (requisition.getStatus() == RequisitionStatus.APPROVED || requisition.getStatus().name().contains("REJECTED")) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Workflow already completed");
        }

        // Duplicate approval
        if (approvalRepo.existsByRequisitionAndApprovalType(requisition, approvalType)) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Approval already recorded");
        }

        RequisitionStatus oldStatus = requisition.getStatus();

        boolean approved = dto.getDecision().equalsIgnoreCase("approved");

        RequisitionStatus newStatus = getNextStatus(approvalType, approved);

        requisition.setStatus(newStatus);
        requisition.setUpdatedAt(LocalDateTime.now());

        PurchaseRequisition saved = reqRepo.save(requisition);

        approvalRepo.save(Approval.builder()
                    .requisition(saved)
                    .approver(approver)
                    .approvalType(approvalType)
                    .status(approved? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED)
                    .remarks(dto.getRemarks())
                    .decidedAt(LocalDateTime.now())
                    .build()
        );

        historyRepo.save(RequisitionStatusHistory.builder()
                .requisition(saved)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(approver)
                .remarks(dto.getRemarks())
                .build()
        );
        
        notificationService.notify(requisition.getEmployee(),
                saved,
                null,
                approved? NotificationType.APPROVAL : NotificationType.REJECTION,
                requisition.getRequisitionNo()
        );

        notifyNextApprover(requisition, newStatus);

        auditService.log(
                "PurchaseRequisition",
                saved.getId(),
                "DECISION",
                approver,
                dto.getRemarks()
        );

        return mapToDto(saved);
    }

    public List<PurchaseRequisitionResponseDTO> getAllRequisitions(){
        return reqRepo.findAll()
                .stream()
                .map(requisition -> mapToDto(requisition))
                .toList();
    }

    public List<PurchaseRequisitionResponseDTO> getByStatus(RequisitionStatus status){

        return reqRepo.findByStatus(status)
                .stream()
                .map(requisition -> mapToDto(requisition))
                .toList();
    }

    public List<PurchaseRequisitionResponseDTO> getEmployeeRequisitions(Long employeeId) {

        return reqRepo.findByEmployee_Id(employeeId)
                .stream()
                .map(requisition -> mapToDto(requisition))
                .toList();
    }

    public PurchaseRequisitionResponseDTO getById(Long id) {

        PurchaseRequisition requisition = reqRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requisition not found"));

        return mapToDto(requisition);
    }

    public List<RequisitionItemResponseDTO> getItemsOfRequisition(Long id) {
        return itemService.getItems(id);
    }

    @Transactional
    public void deleteRequisition(Long id) {
            PurchaseRequisition requisition = reqRepo.findById(id)
            .orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Requisition not found"));

        auditService.log("PurchaseRequisition", id, "DELETE", null, "Requisition deleted");
        reqRepo.delete(requisition);
    }
}
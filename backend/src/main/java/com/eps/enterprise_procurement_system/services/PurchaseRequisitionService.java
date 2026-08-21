package com.eps.enterprise_procurement_system.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.eps.enterprise_procurement_system.util.CurrentUser;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.eps.enterprise_procurement_system.dto.ApprovalResponseDTO;
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
    private final CurrentUser currentUser;

    public PurchaseRequisitionResponseDTO mapToDto(PurchaseRequisition requisition) {

        PurchaseRequisitionResponseDTO dto = PurchaseRequisitionResponseDTO.builder().id(requisition.getId())
                .requisitionNo(requisition.getRequisitionNo())
                .title(requisition.getTitle())
                .description(requisition.getDescription())
                .employeeName(requisition.getEmployee().getFullName())
                .departmentName(requisition.getEmployee().getDepartment().getDepartmentName())
                .status(requisition.getStatus())
                .totalEstimatedAmount(requisition.getTotalEstimatedAmount())
                .isDuplicate(requisition.getIsDuplicate())
                .createdAt(requisition.getCreatedAt())
                .updatedAt(requisition.getUpdatedAt())
                .build();

        if (requisition.getEmployee() != null) {
            dto.setEmployeeName(requisition.getEmployee().getFullName());

            // Department comes through Employee/User 
            if (requisition.getEmployee().getDepartment() != null) {
                dto.setDepartmentName(requisition.getEmployee().getDepartment().getDepartmentName());
            }
        }
        // Requisition Items 
        if (requisition.getItems() != null) {
            dto.setItems(requisition.getItems().stream().map(this::convertItemToDTO).toList());
        }

        if (requisition.getLatestApproval() != null) {
            Approval latestApproval = requisition.getLatestApproval();

            ApprovalResponseDTO approvalDTO = ApprovalResponseDTO.builder()
                    .requisitionId(requisition.getId())
                    .requisitionNo(requisition.getRequisitionNo())
                    .approvalType(latestApproval.getApprovalType())
                    .approverId(latestApproval.getApprover().getId())
                    .status(latestApproval.getStatus())
                    .approverName(latestApproval.getApprover().getFullName())
                    .remarks(latestApproval.getRemarks())
                    .decidedAt(latestApproval.getDecidedAt()).build();

            dto.setLatestApproval(approvalDTO);
        }
        return dto;
    }

    private RequisitionItemResponseDTO convertItemToDTO(RequisitionItem item) {
        RequisitionItemResponseDTO dto = new RequisitionItemResponseDTO();
        
        dto.setId(item.getId());
        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProduct().getName());
            if (item.getProduct().getCategory() != null) {
                dto.setCategoryId(item.getProduct().getCategory().getId());
                dto.setCategoryName(item.getProduct().getCategory().getCategoryName());
            }
        }
        
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        return dto;
    }

    private RequisitionStatus getNextStatus(ApprovalType approvalType, boolean approved) {

        if (!approved) {
            return switch (approvalType) {
                case MANAGER -> RequisitionStatus.MANAGER_REJECTED;
                case FINANCE -> RequisitionStatus.FINANCE_REJECTED;
                case PROCUREMENT -> RequisitionStatus.PROCUREMENT_REJECTED;
                case HIGHER_AUTHORITY -> RequisitionStatus.ADMIN_REJECTED;
            };
        }

        return switch (approvalType) {
            case MANAGER -> RequisitionStatus.PENDING_FINANCE;
            case FINANCE -> RequisitionStatus.PENDING_PROCUREMENT;
            case PROCUREMENT -> RequisitionStatus.APPROVED;
            case HIGHER_AUTHORITY -> RequisitionStatus.APPROVED;
        };
    }

    private void notifyNextApprover(PurchaseRequisition requisition, RequisitionStatus status){

        Role role = switch (status) {
            case PENDING_MANAGER -> Role.MANAGER;
            case PENDING_FINANCE -> Role.FINANCE;
            case PENDING_PROCUREMENT -> Role.PROCUREMENT;
            case PENDING_ADMIN -> Role.ADMIN;
            case APPROVED -> Role.PROCUREMENT;
            default -> null;
        };

        if(role==null)
            return;

        if (role == Role.MANAGER) {
            userRepo.findByRole(role)
                .forEach(user ->
                    notificationService.notify(
                            user,
                            requisition,
                            null,
                            NotificationType.APPROVAL,
                            requisition.getRequisitionNo() + "\nStatus: " + requisition.getStatus())
                    );
        }
        else {
            userRepo.findByRole(role)
                    .forEach(user -> notificationService.notify(
                            user,
                            requisition,
                            null,
                            NotificationType.APPROVAL,
                            requisition.getRequisitionNo() + "\nStatus: " + requisition.getStatus()
                                    + "\nApproval Type: " + requisition.getLatestApproval().getApprovalType()));
        }
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
                    .totalPrice(total)
                    .build();

            requisition.getItems().add(item);

            total = total.add(
                    item.getUnitPrice().multiply(
                            BigDecimal.valueOf(item.getQuantity())));
        }

        requisition.setTotalEstimatedAmount(total);
        requisition.setLatestApproval(null);
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

        userRepo.findByRole(Role.ADMIN)
            .forEach(admin -> notificationService.notify(
                            admin,
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


        if (requisition.getEmployee().getId().equals(approver.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You cannot approve your own requisition");
        }
        

        if (requisition.getStatus() == RequisitionStatus.APPROVED || requisition.getStatus().name().contains("REJECTED")) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Workflow already completed");
        }


        boolean alreadyDecided = approvalRepo.existsByRequisitionAndApprovalTypeAndStatusIn(
                requisition,
                approvalType,
                List.of(
                        ApprovalStatus.APPROVED,
                        ApprovalStatus.REJECTED
                )
        );

        if (alreadyDecided) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Approval already recorded"
            );
        }

        RequisitionStatus oldStatus = requisition.getStatus();

        boolean approved = dto.getDecision().equalsIgnoreCase("approved");

        RequisitionStatus newStatus = getNextStatus(approvalType, approved);

        requisition.setStatus(newStatus);
        requisition.setUpdatedAt(LocalDateTime.now());

        Approval approval = Approval.builder()
                    .requisition(requisition)
                    .approver(approver)
                    .approvalType(approvalType)
                    .status(approved? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED)
                    .remarks(dto.getRemarks())
                    .decidedAt(LocalDateTime.now())
                    .build();

        requisition.setLatestApproval(approval);

        PurchaseRequisition saved = reqRepo.save(requisition);

        approvalRepo.save(approval);

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

    public List<PurchaseRequisitionResponseDTO> getByStatus(String status){

        return reqRepo.findByStatus(RequisitionStatus.valueOf(status))
                .stream()
                .map(requisition -> mapToDto(requisition))
                .toList();
    }

    public List<PurchaseRequisitionResponseDTO> getManagerByStatus(RequisitionStatus status){

        return reqRepo.findByEmployee_Department_IdAndStatus(currentUser.get().getDepartment().getId(),status)
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

    public PurchaseRequisitionResponseDTO getByRequisitionId(Long id) {

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
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Requisition not found"));

        auditService.log("PurchaseRequisition", id, "DELETE", null, "Requisition deleted");
        reqRepo.delete(requisition);
    }
}
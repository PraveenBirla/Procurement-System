package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.ApprovalRequestDTO;
import com.eps.enterprise_procurement_system.dto.ApprovalResponseDTO;
import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionResponseDTO;
import com.eps.enterprise_procurement_system.dto.RequisitionItemResponseDTO;
import com.eps.enterprise_procurement_system.entities.Approval;
import com.eps.enterprise_procurement_system.entities.PurchaseOrder;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.ApprovalStatus;
import com.eps.enterprise_procurement_system.entities.enums.ApprovalType;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import com.eps.enterprise_procurement_system.repositories.ApprovalRepo;
import com.eps.enterprise_procurement_system.repositories.PurchaseRequisitionRepo;
import com.eps.enterprise_procurement_system.repositories.UserRepository;
import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalRepo approvalRepo;
    private final PurchaseRequisitionRepo requisitionRepo;
    private final UserRepository userRepo;
    private final ModelMapper modelMapper;

    private ApprovalResponseDTO convertToDTO(Approval approval) {

        ApprovalResponseDTO dto = modelMapper.map(approval, ApprovalResponseDTO.class);

        dto.setId(approval.getId());
        dto.setRequisitionId(approval.getRequisition().getId());
        dto.setRequisitionNo(approval.getRequisition().getRequisitionNo());
        dto.setApproverId(approval.getApprover().getId());
        dto.setApproverName(approval.getApprover().getFullName());

        return dto;
    }

    public List<ApprovalResponseDTO> getAllApprovals() {

        return approvalRepo.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public ApprovalResponseDTO getApprovalById(Long id) {

        Approval approval = approvalRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Approval not found"));

        return convertToDTO(approval);
    }

        @Transactional
    public ApprovalResponseDTO createApproval(ApprovalRequestDTO dto) {

        PurchaseRequisition requisition = requisitionRepo.findById(dto.getRequisitionId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Requisition not found"));

        User approver = userRepo.findById(dto.getApproverId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Approver not found"));

        Approval approval = Approval.builder()
                .requisition(requisition)
                .approver(approver)
                .approvalType(dto.getApprovalType())
                .status(dto.getStatus())
                .remarks(dto.getRemarks())
                .decidedAt(LocalDateTime.now())
                .build();

        return convertToDTO(approvalRepo.save(approval));
    }
    
    @Transactional
    public ApprovalResponseDTO updateApproval(Long id,
            ApprovalRequestDTO dto) {

        Approval approval = approvalRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Approval not found"));

        PurchaseRequisition requisition = requisitionRepo.findById(dto.getRequisitionId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Requisition not found"));

        User approver = userRepo.findById(dto.getApproverId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Approver not found"));

        approval.setRequisition(requisition);
        approval.setApprover(approver);
        approval.setApprovalType(dto.getApprovalType());
        approval.setStatus(dto.getStatus());
        approval.setRemarks(dto.getRemarks());
        approval.setDecidedAt(LocalDateTime.now());

        return convertToDTO(approvalRepo.save(approval));
    }

    @Transactional
    public String deleteApproval(Long id) {

        Approval approval = approvalRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Approval not found"));

        approvalRepo.delete(approval);

        return "Approval deleted successfully";
    }

    public List<PurchaseRequisitionResponseDTO> getManagerRequisitions(
            ApprovalStatus status) {

        List<PurchaseRequisition>  requisitions =  approvalRepo.findRequisitionsByApprovalTypeAndStatus(
                ApprovalType.MANAGER,
                status
        );

        List<PurchaseRequisitionResponseDTO> response = requisitions.stream()
                .map(this::mapToResponseDTO)
                .toList();

        return response;
    }

    private PurchaseRequisitionResponseDTO mapToResponseDTO(PurchaseRequisition req) {
        return PurchaseRequisitionResponseDTO.builder()
                .id(req.getId())
                .requisitionNo(req.getRequisitionNo())
                .title(req.getTitle())
                .description(req.getDescription())
                .totalEstimatedAmount(req.getTotalEstimatedAmount())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .employeeName(req.getEmployee().getFullName())
                .build();
    }

    public List<PurchaseRequisitionResponseDTO> getFinanceRequisitions(ApprovalStatus status) {

        List<PurchaseRequisition>  requisitions =  approvalRepo.findRequisitionsByApprovalTypeAndStatus(
                ApprovalType.FINANCE,
                status
        );

        List<PurchaseRequisitionResponseDTO> response = requisitions.stream()
                .map(this::mapToResponseDTO)
                .toList();

        return response;
    }

    public List<PurchaseRequisitionResponseDTO> getProcurementRequisitions( ApprovalStatus status) {

        List<PurchaseRequisition> requisitions =
                approvalRepo.findRequisitionsByApprovalTypeAndStatus(
                        ApprovalType.PROCUREMENT,
                        status
                );

        return requisitions.stream()
                .map(req -> PurchaseRequisitionResponseDTO.builder()
                        .id(req.getId())
                        .requisitionNo(req.getRequisitionNo())
                        .title(req.getTitle())
                        .description(req.getDescription())

                        .status(req.getStatus())
                        .totalEstimatedAmount(req.getTotalEstimatedAmount())
                        .isDuplicate(req.getIsDuplicate())
                        .createdAt(req.getCreatedAt())
                        .updatedAt(req.getUpdatedAt())

                        .items(
                                req.getItems().stream()
                                        .map(item -> RequisitionItemResponseDTO.builder()
                                                .id(item.getId())
                                                .productId(item.getProduct().getId())
                                                .categoryId(item.getProduct().getCategory().getId())
                                                .productName(item.getProduct().getName())
                                                .quantity(item.getQuantity())
                                                .unitPrice(item.getUnitPrice())
                                                .build())
                                        .toList()
                        )
                        .build())
                .toList();
    }
}
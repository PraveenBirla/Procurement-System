package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.ApprovalRequestDTO;
import com.eps.enterprise_procurement_system.dto.ApprovalResponseDTO;
import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionResponseDTO;
import com.eps.enterprise_procurement_system.entities.enums.ApprovalStatus;
import com.eps.enterprise_procurement_system.services.ApprovalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ApprovalResponseDTO>>> getAll() {

        return ResponseEntity.ok(new ApiResponse<>(approvalService.getAllApprovals()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApprovalResponseDTO>> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(new ApiResponse<>(approvalService.getApprovalById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','FINANCE')")
    public ResponseEntity<ApiResponse<ApprovalResponseDTO>> create(
            @Valid @RequestBody ApprovalRequestDTO dto) {

        return new ResponseEntity<>(new ApiResponse<>(approvalService.createApproval(dto)),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','FINANCE')")
    public ResponseEntity<ApiResponse<ApprovalResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalRequestDTO dto) {

        return ResponseEntity.ok(new ApiResponse<>(approvalService.updateApproval(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String,String>>> delete(
            @PathVariable Long id) {

        return ResponseEntity.ok(new ApiResponse<>(Map.of("message", approvalService.deleteApproval(id))));
    }

    @GetMapping("/manager")
    public ResponseEntity<ApiResponse<List<PurchaseRequisitionResponseDTO>>> getManagerRequisitions(
            @RequestParam ApprovalStatus status) {

        List<PurchaseRequisitionResponseDTO> result= approvalService.getManagerRequisitions(status);
        return ResponseEntity.ok(new ApiResponse<>(result));

    }

    @GetMapping("/finance")
    public ResponseEntity<ApiResponse<List<PurchaseRequisitionResponseDTO>>> getFinanceRequisitions(
            @RequestParam ApprovalStatus status) {

        List<PurchaseRequisitionResponseDTO> result= approvalService.getFinanceRequisitions(status);
        return ResponseEntity.ok(new ApiResponse<>(result));

    }

    @GetMapping("/procurement")
    public ResponseEntity<ApiResponse<List<PurchaseRequisitionResponseDTO>>> getProcurementRequisitions(
            @RequestParam String status) {

        List<PurchaseRequisitionResponseDTO> result= approvalService.getProcurementRequisitions(status);
        return ResponseEntity.ok(new ApiResponse<>(result));

    }




}
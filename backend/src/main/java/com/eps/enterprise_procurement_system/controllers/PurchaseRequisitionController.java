package com.eps.enterprise_procurement_system.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.DecisionRequestDTO;
import com.eps.enterprise_procurement_system.dto.RequisitionItemResponseDTO;
import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionRequestDTO;
import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionResponseDTO;
import com.eps.enterprise_procurement_system.entities.enums.ApprovalType;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import com.eps.enterprise_procurement_system.services.PurchaseRequisitionService;
import com.eps.enterprise_procurement_system.util.CurrentUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/requisitions")
@RequiredArgsConstructor
public class PurchaseRequisitionController {

    private final PurchaseRequisitionService service;
    private final CurrentUser currentUser;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PurchaseRequisitionResponseDTO>> create(@Valid @RequestBody PurchaseRequisitionRequestDTO req) {
        return ResponseEntity.ok(new ApiResponse<>(service.createRequisition(req, currentUser.get())));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<PurchaseRequisitionResponseDTO>>> getAll(){
        return ResponseEntity.ok(new ApiResponse<>(service.getAllRequisitions()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FINANCE', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<PurchaseRequisitionResponseDTO>>> getRequisitionsByStatus(@RequestParam(required=true) RequisitionStatus status) {
        return ResponseEntity.ok(new ApiResponse<>( service.getByStatus(status)));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<PurchaseRequisitionResponseDTO>>> mine() {
        return ResponseEntity.ok(new ApiResponse<>(service.getEmployeeRequisitions(currentUser.get().getId())));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public  ResponseEntity<ApiResponse<List<PurchaseRequisitionResponseDTO>>> getRequisitionByEmployeeId(@PathVariable Long employeeId) {

         List<PurchaseRequisitionResponseDTO> list = service.getEmployeeRequisitions(employeeId);
         return ResponseEntity.ok(new ApiResponse<>(list));

    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PurchaseRequisitionResponseDTO>> getRequisitionByRequisitionId(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(service.getByRequisitionId(id)));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<List<RequisitionItemResponseDTO>>> items(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(service.getItemsOfRequisition(id)));
    }

    @PostMapping("/{id}/manager-decision")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseRequisitionResponseDTO>> manager(@PathVariable Long id, @Valid @RequestBody DecisionRequestDTO req) {
        return ResponseEntity.ok(new ApiResponse<>(service.decideRequisition(id, ApprovalType.MANAGER, req, currentUser.get())));
    }

    @PostMapping("/{id}/finance-decision")
    @PreAuthorize("hasRole('FINANCE')")
    public ResponseEntity<ApiResponse<PurchaseRequisitionResponseDTO>> finance(@PathVariable Long id, @Valid @RequestBody DecisionRequestDTO req) {
        return ResponseEntity.ok(new ApiResponse<>(service.decideRequisition(id, ApprovalType.FINANCE, req, currentUser.get())));
    }

    @PostMapping("/{id}/procurement-decision")
    @PreAuthorize("hasRole('FINANCE')")
    public ResponseEntity<ApiResponse<PurchaseRequisitionResponseDTO>>  procurement(@PathVariable Long id, @Valid @RequestBody DecisionRequestDTO req) {
        return ResponseEntity.ok(new ApiResponse<>(service.decideRequisition(id, ApprovalType.PROCUREMENT, req, currentUser.get())));
    }


    @PostMapping("/{id}/admin-decision")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PurchaseRequisitionResponseDTO>> admin(@PathVariable Long id,
            @Valid @RequestBody DecisionRequestDTO req) {
        return ResponseEntity.ok(new ApiResponse<>(
                service.decideRequisition(id, ApprovalType.HIGHER_AUTHORITY, req, currentUser.get())));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void deleteRequisition(@PathVariable Long id) {
        service.deleteRequisition(id);
    }
}

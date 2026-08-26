package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.*;
import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.entities.enums.ReturnStatus;
import com.eps.enterprise_procurement_system.repositories.SupplierRepo;
import com.eps.enterprise_procurement_system.services.ReturnReplacementService;
import com.eps.enterprise_procurement_system.services.SupplierService;
import com.eps.enterprise_procurement_system.services.UserService;
import com.eps.enterprise_procurement_system.util.CurrentUser;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/return-replacements")
@RequiredArgsConstructor
public class ReturnReplacementController {

    private final SupplierRepo supplierRepo;
    private final CurrentUser currentUser;
    private final ReturnReplacementService returnReplacementService;


    @PostMapping
    public ResponseEntity<ApiResponse<ReturnReplacementResponseDTO>> create(
            @RequestBody ReturnReplacementRequestDTO dto) {

        ReturnReplacementResponseDTO response = returnReplacementService.createReturn(
                        dto,
                        currentUser.get()
                );

        return new ResponseEntity<>(new ApiResponse<>(response), HttpStatus.CREATED);
    }

    @GetMapping("/purchase-order/{poId}")
    public ResponseEntity<ApiResponse<List<ReturnReplacementResponseDTO>>>
            getByPurchaseOrder(@PathVariable Long poId) {

        return ResponseEntity.ok(
                new ApiResponse<>(returnReplacementService.getByPurchaseOrder(poId))
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReturnReplacementResponseDTO>>
            getById(@PathVariable Long id) {

        return ResponseEntity.ok(new ApiResponse<>(returnReplacementService.getById(id)));
    }

    @GetMapping("/po/pending")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<List<ReturnReplacementResponseDTO>>>
            getPendingPOReturns() {

        return ResponseEntity.ok(
            new ApiResponse<>(returnReplacementService.getPendingPOReturns())
        );
    }

    @GetMapping("/supplier/pending")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<List<ReturnReplacementResponseDTO>>>
            getPendingSupplierReturns() {

        Supplier supplier = supplierRepo.findByUser_Id(currentUser.get().getId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Category already exists"
        ));

        return ResponseEntity.ok(
            new ApiResponse<>(returnReplacementService.getPendingSupplierReturns(supplier.getId()))
        );
    }

    @PutMapping("/{id}/supplier-status")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<ReturnReplacementResponseDTO>>
    updateSupplierStatus(
            @PathVariable Long id,
            @RequestParam ReturnStatus status) {

        ReturnReplacementResponseDTO response = returnReplacementService.updateSupplierStatus(
                        id,
                        status,
                        currentUser.get()
                );

        return ResponseEntity.ok(new ApiResponse<>(response));
    }
}
package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.SupplierDocumentRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierDocumentResponseDTO;
import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import com.eps.enterprise_procurement_system.services.SupplierDocumentService;
import com.eps.enterprise_procurement_system.util.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/supplier-documents")
@RequiredArgsConstructor
public class SupplierDocumentController {

    private final SupplierDocumentService supplierDocumentService;
    private final CurrentUser currentUser;

    // ==========================================================
    // ADMIN / PROCUREMENT
    // ==========================================================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public ResponseEntity<ApiResponse<List<SupplierDocumentResponseDTO>>> getAllDocuments() {

        return ResponseEntity.ok(
                new ApiResponse<>(supplierDocumentService.getAllDocuments()));
    }

    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public ResponseEntity<ApiResponse<List<SupplierDocumentResponseDTO>>> getDocumentsBySupplier(
            @PathVariable Long supplierId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        supplierDocumentService.getDocumentsBySupplier(supplierId)));
    }

    // ==========================================================
    // LOGGED-IN SUPPLIER
    // ==========================================================

    @GetMapping("/my-documents")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<List<SupplierDocumentResponseDTO>>> getMyDocuments() {

        return ResponseEntity.ok(new ApiResponse<>(
                        supplierDocumentService.getMyDocuments(currentUser.get())));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<SupplierDocumentResponseDTO>> uploadDocument(
            @Valid @RequestBody SupplierDocumentRequestDTO dto) {

        return new ResponseEntity<>(
                new ApiResponse<>(supplierDocumentService.createDocument(dto, currentUser.get())),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<SupplierDocumentResponseDTO>> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody SupplierDocumentRequestDTO dto) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        supplierDocumentService.updateDocument(
                                id,
                                dto,
                                currentUser.get())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteDocument( @PathVariable Long id) {

        return ResponseEntity.ok(
                new ApiResponse<>(Map.of(
                            "message",
                            supplierDocumentService.deleteDocument(
                            id,
                            currentUser.get()))));
    }

    // ==========================================================
    // PROCUREMENT / ADMIN VERIFICATION
    // ==========================================================

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public ResponseEntity<ApiResponse<SupplierDocumentResponseDTO>> verifyDocument(
            @PathVariable Long id,
            @RequestParam VerificationStatus status,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        supplierDocumentService.verifyDocument(
                                id,
                                status,
                                currentUser.get(),
                                remarks)));
    }
}
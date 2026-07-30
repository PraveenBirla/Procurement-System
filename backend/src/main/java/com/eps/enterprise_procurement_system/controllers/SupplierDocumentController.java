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

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierDocumentResponseDTO>>> getAllDocuments() {

        List<SupplierDocumentResponseDTO> documents = supplierDocumentService.getAllDocuments();

        return ResponseEntity.ok(new ApiResponse<>(documents));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDocumentResponseDTO>> getDocumentById(@PathVariable Long id) {

        SupplierDocumentResponseDTO document = supplierDocumentService.getDocumentById(id);

        return ResponseEntity.ok(new ApiResponse<>(document));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<ApiResponse<List<SupplierDocumentResponseDTO>>> getDocumentsBySupplier(
            @PathVariable Long supplierId) {

        List<SupplierDocumentResponseDTO> documents = supplierDocumentService.getDocumentsBySupplier(supplierId);

        return ResponseEntity.ok(new ApiResponse<>(documents));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT', 'SUPPLIER')")
    public ResponseEntity<ApiResponse<SupplierDocumentResponseDTO>> createDocument(
            @Valid @RequestBody SupplierDocumentRequestDTO dto) {

        SupplierDocumentResponseDTO response = supplierDocumentService.createDocument(dto);

        return new ResponseEntity<>(new ApiResponse<>(response), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT', 'SUPPLIER')")
    public ResponseEntity<ApiResponse<SupplierDocumentResponseDTO>> updateDocument(
            @PathVariable Long id, @Valid @RequestBody SupplierDocumentRequestDTO dto) {

        SupplierDocumentResponseDTO response = supplierDocumentService.updateDocument(id, dto);

        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN', 'PROCUREMENT')")
    public ResponseEntity<ApiResponse<SupplierDocumentResponseDTO>> verifyDocument(@PathVariable Long id, @RequestParam VerificationStatus status, @RequestParam(required = false) String remarks) {

        SupplierDocumentResponseDTO response = supplierDocumentService.verifyDocument(
                id, status, currentUser.get(), remarks);

        return ResponseEntity.ok(new ApiResponse<>(response));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<ApiResponse<Map<String,String>>> deleteDocument(@PathVariable Long id) {

        String message = supplierDocumentService.deleteDocument(id);

        return ResponseEntity.ok(new ApiResponse<>(Map.of("message", message)));
    }
    
}
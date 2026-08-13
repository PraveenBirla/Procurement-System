package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.DocumentVerificationRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierDocumentRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierDocumentResponseDTO;
import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.entities.SupplierDocument;
import com.eps.enterprise_procurement_system.entities.enums.SupplierDocumentType;
import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import com.eps.enterprise_procurement_system.repositories.SupplierDocumentRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierRepo;
import com.eps.enterprise_procurement_system.services.CloudinaryService;
import com.eps.enterprise_procurement_system.services.SupplierDocumentService;
import com.eps.enterprise_procurement_system.util.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/supplier-documents")
@RequiredArgsConstructor
public class SupplierDocumentController {

    private final SupplierDocumentService supplierDocumentService;
    private final CurrentUser currentUser;
    private final SupplierRepo supplierRepo;
    private final CloudinaryService cloudinaryService;
    private final SupplierDocumentRepo supplierDocumentRepo;



    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','SUPPLIER')")
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



    @GetMapping("/my-documents")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<List<SupplierDocumentResponseDTO>>> getMyDocuments() {

        return ResponseEntity.ok(new ApiResponse<>(
                        supplierDocumentService.getMyDocuments(currentUser.get())));
    }

    @PostMapping(
            value = "/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('SUPPLIER')")
    public  ResponseEntity<ApiResponse<String>> uploadDocument(
            @RequestParam("documentType") SupplierDocumentType documentType,
            @RequestParam("file") MultipartFile file) {

           return ResponseEntity.ok(new ApiResponse<>(supplierDocumentService.uploadeDocument(documentType,file)));


    }

    @PutMapping(
            value = "/documents/{documentId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<String>> updateDocument(
            @PathVariable Long documentId,
            @RequestParam("file") MultipartFile file) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        supplierDocumentService.updateDocument(documentId, file)
                )
        );
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN', 'PROCUREMENT')")
    public ResponseEntity<ApiResponse<Map<String, String>>> verifyDocument(
                    @PathVariable Long id, @RequestBody DocumentVerificationRequestDTO request) {

            return ResponseEntity.ok(
                            new ApiResponse<>(Map.of("message", supplierDocumentService.updateVerificationStatus(id, request))));
    }
    
}
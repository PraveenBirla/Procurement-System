package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.SupplierRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierResponseDTO;
import com.eps.enterprise_procurement_system.services.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE','MANAGER')")
    public ResponseEntity<ApiResponse<List<SupplierResponseDTO>>> getAllSuppliers() {

        return ResponseEntity.ok(
                new ApiResponse<>(supplierService.getAllSuppliers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE','MANAGER')")
    public ResponseEntity<ApiResponse<SupplierResponseDTO>> getSupplier(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                new ApiResponse<>(supplierService.getSupplierById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<SupplierResponseDTO>> createProfile(
            @Valid @RequestBody SupplierRequestDTO dto) {

        return new ResponseEntity<>(
                new ApiResponse<>(supplierService.createSupplier(dto)),
                HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<SupplierResponseDTO>> myProfile() {

        return ResponseEntity.ok(
                new ApiResponse<>(supplierService.getMyProfile()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<SupplierResponseDTO>> updateProfile(
            @Valid @RequestBody SupplierRequestDTO dto) {

        return ResponseEntity.ok(
                new ApiResponse<>(supplierService.updateSupplier(dto)));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> activateSupplier(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        Map.of("message",
                                supplierService.activateSupplier(id))));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> deactivateSupplier(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        Map.of("message",
                                supplierService.deactivateSupplier(id))));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteSupplier(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        Map.of("message",
                                supplierService.deleteSupplier(id))));
    }
}
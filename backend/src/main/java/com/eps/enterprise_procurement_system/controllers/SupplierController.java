package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.SupplierRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierResponseDTO;
import com.eps.enterprise_procurement_system.services.SupplierService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'FINANCE')")
    public ResponseEntity<ApiResponse<List<SupplierResponseDTO>>> getAllSuppliers() {
        return ResponseEntity.ok(new ApiResponse<>(service.getAllSuppliers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'FINANCE')")
    public ResponseEntity<ApiResponse<SupplierResponseDTO>> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(service.getSupplierById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<ApiResponse<SupplierResponseDTO>> createSupplier(@RequestBody SupplierRequestDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(service.createSupplier(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<ApiResponse<SupplierResponseDTO>> updateSupplier(@PathVariable Long id, @RequestBody SupplierRequestDTO supplier) {
        return ResponseEntity.ok(new ApiResponse<>(service.updateSupplier(id, supplier)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public String deleteSupplier(@PathVariable Long id) {
        return service.deleteSupplier(id);
    }
}

package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.SupplierAverageRatingDTO;
import com.eps.enterprise_procurement_system.dto.SupplierPerformanceRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierPerformanceResponseDTO;
import com.eps.enterprise_procurement_system.services.SupplierPerformanceService;
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
@RequestMapping("/supplier-performance")
@RequiredArgsConstructor
public class SupplierPerformanceController {

    private final SupplierPerformanceService supplierPerformanceService;
    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierPerformanceResponseDTO>>> getAll() {

        return ResponseEntity.ok(new ApiResponse<>(
            supplierPerformanceService.getAllPerformances()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierPerformanceResponseDTO>> getById(@PathVariable Long id) {

        return ResponseEntity.ok(new ApiResponse<>(
            supplierPerformanceService.getPerformanceById(id)));
    }
    
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<ApiResponse<List<SupplierPerformanceResponseDTO>>> getSupplierReviews(
            @PathVariable Long supplierId) {

        return ResponseEntity.ok(new ApiResponse<>(
                supplierPerformanceService.getSupplierPerformances(supplierId)));
    }
    
    @GetMapping("/supplier/{supplierId}/average")
    public ResponseEntity<ApiResponse<SupplierAverageRatingDTO>> averageRating(
            @PathVariable Long supplierId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        supplierPerformanceService.getSupplierAverageRating(supplierId)));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','PROCUREMENT')")
    public ResponseEntity<ApiResponse<SupplierPerformanceResponseDTO>> create(
            @Valid @RequestBody SupplierPerformanceRequestDTO dto) {

        return new ResponseEntity<>(
                new ApiResponse<>(
                        supplierPerformanceService.createPerformance(dto, currentUser.get())),
                HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','PROCUREMENT')")
    public ResponseEntity<ApiResponse<SupplierPerformanceResponseDTO>> update(
            @PathVariable Long id, @Valid @RequestBody SupplierPerformanceRequestDTO dto) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        supplierPerformanceService.updatePerformance(id, dto)));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String,String>>> delete(@PathVariable Long id){

        String message = supplierPerformanceService.deletePerformance(id);

        return ResponseEntity.ok(new ApiResponse<>(Map.of("message",message)));
    }
}
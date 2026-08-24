package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.AllSupplierResponseDTO;
import com.eps.enterprise_procurement_system.dto.ReturnReplacementResponseDTO;
import com.eps.enterprise_procurement_system.dto.SupplierRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierResponseDTO;
import com.eps.enterprise_procurement_system.dto.VendorRecommendationResponseDTO;
import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import com.eps.enterprise_procurement_system.services.ReturnReplacementService;
import com.eps.enterprise_procurement_system.services.SupplierService;
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
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

        private final CurrentUser currentUser;
        private final SupplierService supplierService;
        private final ReturnReplacementService returnReplacementService;

    @GetMapping

    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE','MANAGER')")

    public ResponseEntity<ApiResponse<List<AllSupplierResponseDTO>>> getAllSuppliers() {

        return ResponseEntity.ok(
                new ApiResponse<>(supplierService.getAllSuppliers()));
    }

    @GetMapping("/{categoryId}/category")
    @PreAuthorize("hasAnyRole('ADMIN',  'PROCUREMENT_OFFICER')")
    public ResponseEntity<ApiResponse<List<SupplierResponseDTO>>> getVerifiedSuppliersByCategoryId(@Valid  @PathVariable Long categoryId) {
        return ResponseEntity.ok(new ApiResponse<>( supplierService.getVerifiedSuppliersByCategoryId(categoryId, VerificationStatus.VERIFIED)));
    }

    @GetMapping("/recommendations")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT')")
    public ResponseEntity<ApiResponse<VendorRecommendationResponseDTO>> getRecommendations(@RequestParam Long categoryId) {
        return ResponseEntity.ok(new ApiResponse<>(supplierService.getRecommendations(categoryId)));
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

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT')")
    public ResponseEntity<ApiResponse<Map<String,String>>> updateSupplierVerification(
                    @PathVariable Long id, @RequestBody Map<String, String> request) {

            String status = request.get("status");

            String message = supplierService.updateSupplierVerification(id, status);

            return ResponseEntity.ok(
                            new ApiResponse<>(
                                            Map.of("message", message)));
    }

//     @PutMapping("/{id}/unverify")
//     @PreAuthorize("hasRole('ADMIN', 'PROCUREMENT')")
//     public ResponseEntity<ApiResponse<Map<String,String>>> unverifySupplier(
//             @PathVariable Long id){

//         return ResponseEntity.ok(
//                 new ApiResponse<>(
//                         Map.of("message",supplierService.unverifySupplier(id))
//                 )
//         );
//     }

}

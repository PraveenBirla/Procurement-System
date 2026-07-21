package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionRequestDTO;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.services.PurchaseRequisitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requisitions")
@RequiredArgsConstructor
public class PurchaseRequisitionController {

    private final PurchaseRequisitionService service;

    @PostMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Map<String,String>>> createRequisition(@PathVariable Long id, @RequestBody PurchaseRequisitionRequestDTO dto) {
         String message = service.createRequisition(id,dto);

         return ResponseEntity.ok(new ApiResponse<>(Map.of("message" , message)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public List<PurchaseRequisition> getAllRequisitions() {
        return service.getAllRequisitions();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public PurchaseRequisition getRequisitionById(@PathVariable Long id) {
        return service.getRequisitionById(id);
    }



    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void deleteRequisition(@PathVariable Long id) {
        service.deleteRequisition(id);
    }
}

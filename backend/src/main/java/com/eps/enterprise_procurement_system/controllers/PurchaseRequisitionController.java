package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionRequestDTO;
import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionResponseDTO;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.services.PurchaseRequisitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requisitions")
@RequiredArgsConstructor
public class PurchaseRequisitionController {

    private final PurchaseRequisitionService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Map<String,String>>> createRequisition(@RequestBody PurchaseRequisitionRequestDTO dto,
                                                                             Authentication authentication) {
        User user = (User) authentication.getPrincipal();
         String message = service.createRequisition(user.getId(),dto);

         return ResponseEntity.ok(new ApiResponse<>(Map.of("message" , message)));
    }

    @GetMapping()
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public  ResponseEntity<ApiResponse<List<PurchaseRequisitionResponseDTO>>> getAllRequisitions() {
         List<PurchaseRequisitionResponseDTO>  list= service.getAllRequisitions();

         return ResponseEntity.ok(new ApiResponse<>(list));
    }

    @GetMapping("/employee")
    @PreAuthorize("hasAnyRole('EMPLOYEE')")
    public  ResponseEntity<ApiResponse<List<PurchaseRequisitionResponseDTO>>> getRequisitionByEmployeeId(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

         List<PurchaseRequisitionResponseDTO> list = service.getRequisitionByEmployeeId(user.getId());

         return ResponseEntity.ok(new ApiResponse<>(list));

    }

    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public  ResponseEntity<ApiResponse<List<PurchaseRequisitionResponseDTO>>> getRequisitionByStatus(@RequestBody String status) {

        List<PurchaseRequisitionResponseDTO> list = service.getRequisitionByStatus(status);

        return ResponseEntity.ok(new ApiResponse<>(list));

    }





//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
//    public void deleteRequisition(@PathVariable Long id) {
//        service.deleteRequisition(id);
//    }


}

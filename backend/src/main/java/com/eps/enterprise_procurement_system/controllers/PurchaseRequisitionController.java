package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.services.PurchaseRequisitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requisitions")
@RequiredArgsConstructor
public class PurchaseRequisitionController {

    private final PurchaseRequisitionService service;

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

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE')")
    public PurchaseRequisition createRequisition(@RequestBody PurchaseRequisition req) {
        return service.createRequisition(req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void deleteRequisition(@PathVariable Long id) {
        service.deleteRequisition(id);
    }
}

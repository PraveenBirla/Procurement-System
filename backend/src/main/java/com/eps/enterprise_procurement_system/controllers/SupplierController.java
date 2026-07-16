package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.services.SupplierService;
import lombok.RequiredArgsConstructor;
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
    public List<Supplier> getAllSuppliers() {
        return service.getAllSuppliers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'FINANCE')")
    public Supplier getSupplierById(@PathVariable Long id) {
        return service.getSupplierById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER')")
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return service.createSupplier(supplier);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER')")
    public Supplier updateSupplier(@PathVariable Long id, @RequestBody Supplier supplier) {
        return service.updateSupplier(id, supplier);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public void deleteSupplier(@PathVariable Long id) {
        service.deleteSupplier(id);
    }
}

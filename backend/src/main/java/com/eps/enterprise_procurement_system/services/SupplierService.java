package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.repositories.SupplierRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepo repo;

    public List<Supplier> getAllSuppliers() {
        return repo.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    @Transactional
    public Supplier createSupplier(Supplier supplier) {
        return repo.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(Long id, Supplier supplierDetails) {
        Supplier supplier = getSupplierById(id);
        supplier.setName(supplierDetails.getName());
        supplier.setEmail(supplierDetails.getEmail());
        supplier.setPhone(supplierDetails.getPhone());
        supplier.setAddress(supplierDetails.getAddress());
        supplier.setIsActive(supplierDetails.getIsActive());
        return repo.save(supplier);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        repo.deleteById(id);
    }
}

package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.repositories.PurchaseRequisitionRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseRequisitionService {
    private final PurchaseRequisitionRepo repo;

    public List<PurchaseRequisition> getAllRequisitions() {
        return repo.findAll();
    }

    public PurchaseRequisition getRequisitionById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Requisition not found"));
    }

    @Transactional
    public PurchaseRequisition createRequisition(PurchaseRequisition req) {
        return repo.save(req);
    }

    @Transactional
    public void deleteRequisition(Long id) {
        repo.deleteById(id);
    }
}

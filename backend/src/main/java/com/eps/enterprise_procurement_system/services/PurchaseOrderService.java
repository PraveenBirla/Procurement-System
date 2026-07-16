package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.entities.PurchaseOrder;
import com.eps.enterprise_procurement_system.repositories.PurchaseOrderRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {
    private final PurchaseOrderRepo repo;

    public List<PurchaseOrder> getAllOrders() {
        return repo.findAll();
    }

    public PurchaseOrder getOrderById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Purchase Order not found"));
    }

    @Transactional
    public PurchaseOrder createOrder(PurchaseOrder order) {
        return repo.save(order);
    }

    @Transactional
    public void deleteOrder(Long id) {
        repo.deleteById(id);
    }
}

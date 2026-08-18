package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.PurchaseOrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

public interface PurchaseOrderHistoryRepo extends JpaRepository<PurchaseOrderHistory, Long> {
    @Override
    List<PurchaseOrderHistory> findAll();

    List<PurchaseOrderHistory> findByPurchaseOrderIdOrderByChangedAtAsc(Long poId);
}

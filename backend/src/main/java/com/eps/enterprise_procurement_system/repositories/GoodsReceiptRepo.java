package com.eps.enterprise_procurement_system.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.GoodsReceipt;

public interface GoodsReceiptRepo extends JpaRepository<GoodsReceipt, Long> {
    
    Optional<GoodsReceipt> findByPurchaseOrder_Id(Long poId);
}

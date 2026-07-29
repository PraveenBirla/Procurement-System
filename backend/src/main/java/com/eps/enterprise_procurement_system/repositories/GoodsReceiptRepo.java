package com.eps.enterprise_procurement_system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.GoodsReceipt;

public interface GoodsReceiptRepo extends JpaRepository<GoodsReceipt, Long> {
    
    List<GoodsReceipt> findByPurchaseOrder_Id(Long poId);
}

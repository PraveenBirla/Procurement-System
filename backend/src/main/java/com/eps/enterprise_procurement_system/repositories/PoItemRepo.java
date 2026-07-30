package com.eps.enterprise_procurement_system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.PoItem;
import com.eps.enterprise_procurement_system.entities.PurchaseOrder;

public interface PoItemRepo extends JpaRepository<PoItem, Long> {
    
    List<PoItem> findByPurchaseOrder(PurchaseOrder purchaseOrder);

    List<PoItem> findByPurchaseOrder_Id(Long po_id);

    void deleteByPurchaseOrder_Id(Long poId);
}

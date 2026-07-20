package com.eps.enterprise_procurement_system.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.InventoryTransaction;

public interface InventoryTransactionRepo extends JpaRepository<InventoryTransaction, Long> {
    
}

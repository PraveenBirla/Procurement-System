package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseRequisitionRepo extends JpaRepository<PurchaseRequisition, Long> {
}

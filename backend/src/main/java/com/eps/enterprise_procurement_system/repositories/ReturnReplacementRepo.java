package com.eps.enterprise_procurement_system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.ReturnReplacement;
import com.eps.enterprise_procurement_system.entities.enums.ReturnStatus;

public interface ReturnReplacementRepo extends JpaRepository<ReturnReplacement, Long> {
    List<ReturnReplacement> findByPurchaseOrderId(Long purchaseOrderId);

    List<ReturnReplacement> findByStatus(ReturnStatus status);
}

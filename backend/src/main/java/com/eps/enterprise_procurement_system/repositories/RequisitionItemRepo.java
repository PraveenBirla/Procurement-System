package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.RequisitionItem;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RequisitionItemRepo extends JpaRepository<RequisitionItem, Long> {
    List<RequisitionItem> findByRequisition_Id(Long id);
    
    void deleteByRequisition_Id(Long requisitionId);
}

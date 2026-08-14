package com.eps.enterprise_procurement_system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.RequisitionStatusHistory;

public interface RequisitionStatusHistoryRepo extends JpaRepository<RequisitionStatusHistory, Long> {
    List<RequisitionStatusHistory> findByRequisition_IdOrderByChangedAtAsc(Long id);
}
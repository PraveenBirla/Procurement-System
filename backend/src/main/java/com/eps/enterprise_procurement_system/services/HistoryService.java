package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.controllers.RequitionHistoryController;
import com.eps.enterprise_procurement_system.dto.RequisitionStatusHistoryResponseDTO;
import com.eps.enterprise_procurement_system.entities.RequisitionStatusHistory;
import com.eps.enterprise_procurement_system.repositories.RequisitionStatusHistoryRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistoryService {

    private final RequisitionStatusHistoryRepo requisitionStatusHistoryRepo;

    public HistoryService(RequisitionStatusHistoryRepo requisitionStatusHistoryRepo) {
        this.requisitionStatusHistoryRepo = requisitionStatusHistoryRepo;
    }

    private RequisitionStatusHistoryResponseDTO mapToDTO(RequisitionStatusHistory history) {

        return RequisitionStatusHistoryResponseDTO.builder()
                .id(history.getId())
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .changedBy(history.getChangedBy().getRole())
                .remarks(history.getRemarks())
                .changedAt(history.getChangedAt())
                .build();
    }

    public List<RequisitionStatusHistoryResponseDTO> getHistoryByRequitionId(Long id){

        List<RequisitionStatusHistory> list =  requisitionStatusHistoryRepo.findByRequisition_IdOrderByChangedAtAsc(id);
        System.out.println(list);
        return   list.stream()
                .map(this::mapToDTO)
                .toList();

    }


}

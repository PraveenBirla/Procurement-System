package com.eps.enterprise_procurement_system.services;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.eps.enterprise_procurement_system.dto.RequisitionItemResponseDTO;
import com.eps.enterprise_procurement_system.repositories.RequisitionItemRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RequisitionItemService {
    private final RequisitionItemRepo requisitionItemRepo;
    private final ModelMapper modelMapper;

    public List<RequisitionItemResponseDTO> getItems(Long requisitionId) {
        return requisitionItemRepo.findByRequisition_Id(requisitionId).stream()
            .map(item -> {

                RequisitionItemResponseDTO dto = modelMapper.map(item, RequisitionItemResponseDTO.class);
                dto.setProductId(item.getProduct().getId());
                dto.setProductName(item.getProduct().getName());
                return dto;
            })
            .toList();
    }
}

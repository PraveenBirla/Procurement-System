package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseRequisitionResponseDTO {

    private Long id;

    private String requisitionNo;

    private String title;

    private String description;

    private String employeeName;

    private String departmentName;

    private RequisitionStatus status;

    private BigDecimal totalEstimatedAmount;

    private Boolean isDuplicate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<RequisitionItemResponseDTO> items;
}

package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseRequisitionResponseDTO {

    private Long id;

    private String requitionNo;

    private String employeeName;

    private String title;

    private String description;

    private BigDecimal totalEstimatedAmount;

    private RequisitionStatus status;

    private Boolean isDuplicate;

    private LocalDateTime createdAt;

    private List<RequisitionItemResponseDTO> items;
}

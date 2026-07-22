package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RequisitionStatusHistoryResponseDTO {

    private Long id;

    private RequisitionStatus oldStatus;

    private RequisitionStatus newStatus;

    private String changedBy;

    private String remarks;

    private LocalDateTime changedAt;
}

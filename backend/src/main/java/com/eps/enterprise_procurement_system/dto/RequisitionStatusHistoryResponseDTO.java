package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import com.eps.enterprise_procurement_system.entities.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RequisitionStatusHistoryResponseDTO {

    private Long id;

    private RequisitionStatus oldStatus;

    private RequisitionStatus newStatus;

    private Role changedBy;

    private String remarks;

    private LocalDateTime changedAt;
}

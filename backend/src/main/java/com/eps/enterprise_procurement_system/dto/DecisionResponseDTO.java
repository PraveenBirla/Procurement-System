package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DecisionResponseDTO {

    private Long requisitionId;

    private String requisitionNo;

    private RequisitionStatus status;

    private String message;
}

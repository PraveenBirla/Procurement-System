package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.ApprovalStatus;
import com.eps.enterprise_procurement_system.entities.enums.ApprovalType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalResponseDTO {

    private Long id;

    private Long requisitionId;

    private String requisitionNo;

    private Long approverId;

    private String approverName;

    private ApprovalType approvalType;

    private ApprovalStatus status;

    private String remarks;

    private LocalDateTime decidedAt;
}
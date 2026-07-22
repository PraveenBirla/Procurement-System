package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.ApprovalStatus;
import com.eps.enterprise_procurement_system.entities.enums.ApprovalType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApprovalRequestDTO {

    @NotNull
    private Long requisitionId;

    @NotNull
    private Long approverId;

    @NotNull
    private ApprovalType approvalType;

    @NotNull
    private ApprovalStatus status;

    private String remarks;
}
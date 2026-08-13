package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DocumentVerificationRequestDTO {

    @NotNull
    private VerificationStatus status;

    private String remarks;
}
package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SupplierDocumentRequestDTO {

    @NotNull
    private Long supplierId;

    @NotBlank
    private String documentType;

    @NotBlank
    private String documentNumber;

    @NotBlank
    private String fileName;

    @NotBlank
    private String filePath;

    @NotNull
    private Long fileSize;

    @NotBlank
    private String contentType;

    private LocalDate expiryDate;

    private VerificationStatus verificationStatus;

    private Long verifiedById;

    private String remarks;
}

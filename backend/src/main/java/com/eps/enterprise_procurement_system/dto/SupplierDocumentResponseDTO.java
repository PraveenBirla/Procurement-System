package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SupplierDocumentResponseDTO {

    private Long id;

    private Long supplierId;

    private String supplierName;

    private String documentType;

    private String documentNumber;

    private String fileName;

    private String filePath;

    private Long fileSize;

    private String contentType;

    private LocalDate expiryDate;

    private VerificationStatus verificationStatus;

    private Long verifiedById;

    private String verifiedByName;

    private String remarks;
}
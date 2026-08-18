package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.SupplierDocumentType;
import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SupplierDocumentResponseDTO {

    private Long id;

    private Long supplierId;

    private String supplierName;

    private SupplierDocumentType documentType;

    private String fileName;

    private String fileUrl;

    private LocalDateTime uploadedAt;

    private VerificationStatus status;

    private String remarks;
}
package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.SupplierDocument;
import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class AllSupplierResponseDTO {

    private Long id;

    private String name;

    private String email;

    private String companyName;

    private String phone;

    private String address;

    private Long categoryId;

    private String categoryName;

    private BigDecimal rating;

    private Boolean isActive;

    private VerificationStatus status;

    private List<SupplierDocument> supplierDocumentList;

}

package com.eps.enterprise_procurement_system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SupplierPerformanceResponseDTO {

    private Long id;

    private Long supplierId;

    private String supplierName;

    private Long purchaseOrderId;

    private String purchaseOrderNo;

    private BigDecimal qualityRating;

    private BigDecimal deliveryRating;

    private BigDecimal priceRating;

    private BigDecimal overallRating;

    private LocalDate reviewDate;

    private Long reviewedById;

    private String reviewedByName;
}
package com.eps.enterprise_procurement_system.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SupplierAverageRatingDTO {

    private Long supplierId;

    private String supplierName;

    private BigDecimal averageRating;

    private Integer totalReviews;
}
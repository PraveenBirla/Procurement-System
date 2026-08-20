package com.eps.enterprise_procurement_system.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VendorRecommendationDTO {
    private Long supplierId;
    private String supplierName;
    private String categoryName;
    private BigDecimal rating;
    private BigDecimal deliveryRating;
    private BigDecimal priceRating;
    private BigDecimal recommendationScore;
    private int recommendationRank;
    private boolean recommended;
    private String recommendationReason;
}

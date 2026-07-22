package com.eps.enterprise_procurement_system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ProductResponseDTO {

    private Long id;

    private String sku;

    private String name;

    private Long categoryId;

    private String categoryName;

    private String unit;

    private BigDecimal standardPrice;

    private Boolean isActive;

    private LocalDateTime createdAt;
}

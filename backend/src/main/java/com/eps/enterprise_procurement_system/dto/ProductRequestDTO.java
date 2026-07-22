package com.eps.enterprise_procurement_system.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequestDTO {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String unit;

    private BigDecimal standardPrice;

    private String description;

    private Boolean isActive;

}

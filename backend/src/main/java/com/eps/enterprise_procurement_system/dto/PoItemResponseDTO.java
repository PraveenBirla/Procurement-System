package com.eps.enterprise_procurement_system.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class PoItemResponseDTO {

    private Long id;

    private Long productId;

    private String productName;

    private Integer quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;
}
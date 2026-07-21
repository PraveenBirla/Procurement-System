package com.eps.enterprise_procurement_system.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RequisitionItemRequestDTO {

    private Long productId;

    private Integer quantity;

    private BigDecimal unitPrice;
}

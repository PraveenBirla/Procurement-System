package com.eps.enterprise_procurement_system.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RequisitionItemResponseDTO {

    private Long id;

    private Long productId;

    private String productName;

    private Integer quantity;

    private BigDecimal unitPrice;


}

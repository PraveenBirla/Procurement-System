package com.eps.enterprise_procurement_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequisitionItemResponseDTO {

    private Long id;

    private Long productId;

    private String productName;

    private Integer quantity;

    private BigDecimal unitPrice;
}

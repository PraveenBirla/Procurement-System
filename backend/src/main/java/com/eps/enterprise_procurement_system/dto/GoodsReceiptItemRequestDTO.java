package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GoodsReceiptItemRequestDTO {

    @NotNull
    private Long productId;

    @NotNull
    @Min(0)
    private Integer receivedQuantity;

    @NotNull
    @Min(0)
    private Integer acceptedQuantity;

    @NotNull
    @Min(0)
    private Integer rejectedQuantity;

    private String remarks;
}
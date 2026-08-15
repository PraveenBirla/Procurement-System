package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReturnReplacementRequestDTO {

    @NotNull
    private Long purchaseOrderId;

    @NotNull
    private Long goodsReceiptId;

    @NotBlank
    private String reason;
}
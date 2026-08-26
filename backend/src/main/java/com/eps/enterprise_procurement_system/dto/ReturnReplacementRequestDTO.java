package com.eps.enterprise_procurement_system.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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

    @NotEmpty
    private List<ReturnReplacementItemRequestDTO> items;
}
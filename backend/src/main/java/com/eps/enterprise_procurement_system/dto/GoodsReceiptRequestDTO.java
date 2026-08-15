package com.eps.enterprise_procurement_system.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class GoodsReceiptRequestDTO {

    @NotNull
    private Long purchaseOrderId;

    private String remarks;

    @NotEmpty
    private List<GoodsReceiptItemRequestDTO> items;
}

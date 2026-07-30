package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceiptRequestDTO {

    @NotNull
    private Long purchaseOrderId;

    @NotBlank
    private String receivedBy;

    private String remarks;
}

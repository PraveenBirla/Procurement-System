package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PurchaseOrderStatusRequestDTO {

    @NotNull(message = "Status is required")
    private PurchaseOrderStatus status;
}
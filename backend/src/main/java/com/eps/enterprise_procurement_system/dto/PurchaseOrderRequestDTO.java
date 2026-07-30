package com.eps.enterprise_procurement_system.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PurchaseOrderRequestDTO {

    @NotNull(message = "Requisition Id is required")
    private Long requisitionId;

    @NotNull(message = "Supplier Id is required")
    private Long supplierId;

    @FutureOrPresent(message = "Expected delivery date cannot be in the past")
    private LocalDate expectedDeliveryDate;
}
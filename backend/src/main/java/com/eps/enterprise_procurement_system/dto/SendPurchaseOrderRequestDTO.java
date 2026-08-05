package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class SendPurchaseOrderRequestDTO {


    @NotNull(message = "Supplier Id is required")
    private Long supplierId;

    @FutureOrPresent(message = "Expected delivery date cannot be in the past")
    private LocalDate expectedDeliveryDate;

}

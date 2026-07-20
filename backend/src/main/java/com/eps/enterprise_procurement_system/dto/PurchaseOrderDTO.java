package com.eps.enterprise_procurement_system.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PurchaseOrderDTO {
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateRequest {
        @NotNull
        public Long requisitionId;

        @NotNull
        public Long supplierId;
        
        public LocalDate expectedDeliveryDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusRequest {

        @NotBlank
        public String status;
    }
}

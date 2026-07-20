package com.eps.enterprise_procurement_system.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class RequisitionDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank public String title;
        public String description;

        @NotEmpty
        public List<Item> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {

        @NotNull
        public Long productId;

        @NotNull
        @Min(1)
        public Integer quantity;

        @NotNull
        public BigDecimal unitPrice;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DecisionRequest {
        
        @NotBlank
        public String decision;

        public String remarks;
    }
}

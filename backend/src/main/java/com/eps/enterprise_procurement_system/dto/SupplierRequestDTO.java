package com.eps.enterprise_procurement_system.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SupplierRequestDTO {

    @NotBlank(message = "Supplier name is required")
    private String name;

    @Email(message = "Invalid email")
    private String email;

    private String phone;

    private String address;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private BigDecimal rating;

    private Boolean isActive;
}

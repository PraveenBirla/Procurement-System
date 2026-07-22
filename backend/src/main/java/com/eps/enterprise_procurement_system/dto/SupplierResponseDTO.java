package com.eps.enterprise_procurement_system.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class SupplierResponseDTO {

    private Long id;

    private String name;

    private String email;

    private String phone;

    private String address;

    private Long categoryId;

    private String categoryName;

    private BigDecimal rating;

    private Boolean isActive;
}

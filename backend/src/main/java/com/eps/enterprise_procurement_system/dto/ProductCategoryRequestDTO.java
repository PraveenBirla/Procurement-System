package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductCategoryRequestDTO {

    @NotBlank(message = "Category name is required")
    private String categoryName;

    private String description;

}

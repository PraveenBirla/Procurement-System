package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DepartmentRequestDTO {

    @NotBlank(message = "enter a departmentName")
    private String departmentName;

    private LocalDateTime createdAt;


}

package com.eps.enterprise_procurement_system.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DepartmentResponseDTO {

    private  Long id;

    private String deparmentName;

    private LocalDateTime createdAt;


}

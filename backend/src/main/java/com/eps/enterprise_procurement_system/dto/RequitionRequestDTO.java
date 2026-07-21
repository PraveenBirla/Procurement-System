package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RequitionRequestDTO {

    @NotBlank(message = "enter a requisitionNo")
    private String requisitionNo;






}

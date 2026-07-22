package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.RequisitionItem;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseRequisitionRequestDTO {


    @NotBlank(message = "enter a title")
    private String title;

    @NotBlank(message = "enter a description")
    private String description;

    @NotBlank(message="select a products")
    private List<RequisitionItemRequestDTO> items;


}

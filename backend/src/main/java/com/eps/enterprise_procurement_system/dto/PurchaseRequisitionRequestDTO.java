package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionPriority;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseRequisitionRequestDTO {

    private String requisitionNo;

    @NotBlank(message = "enter a title")
    private String title;

    @NotBlank(message = "enter a description")
    private String description;

    @Builder.Default
    private RequisitionPriority priority = RequisitionPriority.NORMAL;

    @Valid
    @NotEmpty(message = "At least one item is required")
    private List<RequisitionItemRequestDTO> items;


}

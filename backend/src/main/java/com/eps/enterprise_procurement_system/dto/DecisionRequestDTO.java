package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DecisionRequestDTO {

    @NotBlank(message = "Decision is required")
    private String decision;

    private String remarks;
}

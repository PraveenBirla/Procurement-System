package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionRequestDTO {

    @NotBlank(message = "Decision is required")
    private String decision;

    private String remarks;
}

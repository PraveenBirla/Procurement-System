package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DecisionRequestDTO {

    @NotBlank(message = "Decision is required")
    @Pattern(
            regexp = "approve|reject",
            message = "Decision must be either approve or reject"
    )
    private String decision;

    @NotBlank(message = "Enter Remak")
    private String remarks;
}

package com.eps.enterprise_procurement_system.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class VendorRecommendationResponseDTO {
    private VendorRecommendationDTO recommendedVendor;
    private List<VendorRecommendationDTO> vendors;
}

package com.eps.enterprise_procurement_system.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterResponseDTO {

    private String accesToken;
    private String refreshToken;
    private String message;
}

package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {

    private String accessToken;
    private String refreshToken;
    private String message;
    private Role role;
}
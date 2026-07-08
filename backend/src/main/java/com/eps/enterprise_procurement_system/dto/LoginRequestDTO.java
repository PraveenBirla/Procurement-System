package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequestDTO {

    @NotBlank(message = "enter a email")
    @Email
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}

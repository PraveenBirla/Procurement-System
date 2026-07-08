package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.config.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NonNull;

import java.time.LocalDateTime;

@Data
public class  RegisterDTO {

    @NotBlank(message = "name is required")
    private String fullName;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "role is required")
    private Role role;

    private LocalDateTime localDateTime = LocalDateTime.now();
}

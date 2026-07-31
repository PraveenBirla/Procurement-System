package com.eps.enterprise_procurement_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

import com.eps.enterprise_procurement_system.entities.enums.Role;

@Data
public class RegisterRequestDTO {

    @NotBlank(message = "name is required")
    private String fullName;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message="select a correct department")
    private Long departmentId;

    private String companyName;
    private String phone;
    private String address;
    private Long categoryId;

    private LocalDateTime localDateTime = LocalDateTime.now();
}

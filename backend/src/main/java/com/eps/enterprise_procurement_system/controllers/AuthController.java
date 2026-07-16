package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.LoginRequestDTO;
import com.eps.enterprise_procurement_system.dto.LoginResponseDTO;
import com.eps.enterprise_procurement_system.dto.RegisterRequestDTO;
import com.eps.enterprise_procurement_system.dto.RegisterResponseDTO;
import com.eps.enterprise_procurement_system.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponseDTO>> register(@Valid @RequestBody RegisterRequestDTO dto){
           RegisterResponseDTO  response = authService.register(dto);

            return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PostMapping("/login")
    public  ResponseEntity<ApiResponse<LoginResponseDTO>> login(@Valid @RequestBody LoginRequestDTO dto){

        LoginResponseDTO s = authService.login(dto);

        return ResponseEntity.ok(new ApiResponse<>(s));
    }
}

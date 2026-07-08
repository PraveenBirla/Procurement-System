package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.dto.RegisterDTO;
import com.eps.enterprise_procurement_system.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<RegisterDTO> register( @Valid @RequestBody RegisterDTO dto){
           RegisterDTO Updated = authService.register(dto);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Updated);
    }
}

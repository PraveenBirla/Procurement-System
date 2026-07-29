package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.ProductRequestDTO;
import com.eps.enterprise_procurement_system.dto.ProductResponseDTO;
import com.eps.enterprise_procurement_system.services.ProductService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> list() {
        return ResponseEntity.ok(new ApiResponse<>(service.getAllProducts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> get(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(service.getProductById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> create(@RequestBody ProductRequestDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(service.createProduct(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> update(@PathVariable Long id, @RequestBody ProductRequestDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(service.updateProduct(id, dto)));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public void delete(@PathVariable Long id) {
        service.deleteProduct(id);
    }
    }


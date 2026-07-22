package com.eps.enterprise_procurement_system.controllers;

import org.springframework.web.bind.annotation.RestController;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.ProductCategoryRequestDTO;
import com.eps.enterprise_procurement_system.dto.ProductCategoryResponseDTO;
import com.eps.enterprise_procurement_system.services.ProductCategoryService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {
    private final ProductCategoryService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductCategoryResponseDTO>>> list() {
        return ResponseEntity.ok(new ApiResponse<>(service.getAllCategories()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductCategoryResponseDTO>> get(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(service.getCategoryById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductCategoryResponseDTO>> create(@RequestBody ProductCategoryRequestDTO body) {
        return ResponseEntity.ok(new ApiResponse<>(service.createCategory(body)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductCategoryResponseDTO>> update(@PathVariable Long id, @RequestBody ProductCategoryRequestDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(service.updateCategory(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public void ResponseEntdelete(@PathVariable Long id) {
        service.deleteCategory(id);
    }
}

package com.eps.enterprise_procurement_system.controllers;

import org.springframework.web.bind.annotation.RestController;

import com.eps.enterprise_procurement_system.entities.ProductCategory;
import com.eps.enterprise_procurement_system.repositories.ProductCategoryRepo;

import lombok.RequiredArgsConstructor;

import java.util.List;

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
    private final ProductCategoryRepo repo;

    @GetMapping
    public List<ProductCategory> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ProductCategory get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ProductCategory create(@RequestBody ProductCategory body) {
        return repo.save(body);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ProductCategory update(@PathVariable Long id, @RequestBody ProductCategory body) {
        body.setId(id); return repo.save(body);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}

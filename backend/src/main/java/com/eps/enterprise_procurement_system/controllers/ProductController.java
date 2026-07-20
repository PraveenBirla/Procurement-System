package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.entities.Product;
import com.eps.enterprise_procurement_system.repositories.ProductRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepo repo;

    @GetMapping
    public List<Product> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public Product create(@RequestBody Product body) {
        return repo.save(body);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public Product update(@PathVariable Long id, @RequestBody Product body) {
        body.setId(id);
        return repo.save(body);
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}


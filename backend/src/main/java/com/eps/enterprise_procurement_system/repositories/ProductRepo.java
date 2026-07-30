package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.Product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);

    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);
}

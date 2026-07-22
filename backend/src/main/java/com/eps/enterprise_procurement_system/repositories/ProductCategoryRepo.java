package com.eps.enterprise_procurement_system.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.ProductCategory;

public interface ProductCategoryRepo extends JpaRepository<ProductCategory, Long>{
    Optional<ProductCategory> findByCategoryName(String categoryName);
}

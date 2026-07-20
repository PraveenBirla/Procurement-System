package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<Product, Long> {
    
}

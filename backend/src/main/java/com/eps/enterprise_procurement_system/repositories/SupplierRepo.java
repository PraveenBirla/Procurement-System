package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierRepo extends JpaRepository<Supplier, Long> {

    List<Supplier> findByCategoryId(Long categoryId);
}

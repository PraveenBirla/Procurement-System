package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.Supplier;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepo extends JpaRepository<Supplier, Long> {

    boolean existsByUser_Id(Long id);

    Optional<Supplier> findByUser_Id(Long userId);
}

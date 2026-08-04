package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.Supplier;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierRepo extends JpaRepository<Supplier, Long> {


    List<Supplier> findByCategoryId(Long categoryId);

    boolean existsByUser_Id(Long id);

    Optional<Supplier> findByUser_Id(Long userId);

    Optional<Supplier> findByUserId(Long userId);

}

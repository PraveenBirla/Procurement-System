package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepo extends JpaRepository<Supplier, Long> {
}

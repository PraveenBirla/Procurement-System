package com.eps.enterprise_procurement_system.repositories;

import com.eps.enterprise_procurement_system.entities.Department;
import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.eps.enterprise_procurement_system.entities.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByRole(Role role);

    User findByEmail(String email);

    User findByFullName(String name);

    List<User> findByDepartment(Department dept);

    List<User> findByDepartmentAndRole(Department department, Role role);

    Optional<User> findBySupplier(Supplier supplier);

}

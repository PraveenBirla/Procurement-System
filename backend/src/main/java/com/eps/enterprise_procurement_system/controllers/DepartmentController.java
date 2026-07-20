package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.entities.Department;
import com.eps.enterprise_procurement_system.repositories.DepartmentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/depts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DepartmentController {
    private final DepartmentRepo repo;

    @GetMapping
    public List<Department> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Department get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public Department create(@RequestBody Department body) {
        return repo.save(body);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public Department update(@PathVariable Long id, @RequestBody Department body) {
        body.setId(id); return repo.save(body);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}


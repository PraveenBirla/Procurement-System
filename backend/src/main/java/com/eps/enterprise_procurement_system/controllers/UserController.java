package com.eps.enterprise_procurement_system.controllers;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.Role;
import com.eps.enterprise_procurement_system.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository repo;

    @GetMapping("/me")
    public ResponseEntity<User> me(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(currentUser);
    }

    @GetMapping
    public List<User> list() {
        return repo.findAll();
    }

    @GetMapping("/role")
    public List<User> getUsersExceptRoleAdmin() {
        return repo.findAllExceptAdmin();
    }

    @GetMapping("/{id}")
    public User get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public User create(@RequestBody User body) {
        return repo.save(body);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public User update(@PathVariable Long id, @RequestBody User body) {
        body.setId(id); return repo.save(body);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}

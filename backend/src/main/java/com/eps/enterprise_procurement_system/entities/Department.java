package com.eps.enterprise_procurement_system.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "department")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_name", nullable = false, unique = true, length = 100)
    private String departmentName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    @Builder.Default
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Budget> budgets = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

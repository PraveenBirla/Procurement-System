package com.eps.enterprise_procurement_system.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_name", nullable = false, unique = true, length = 100)
    private String categoryName;

    @Lob
    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "category")
    @Builder.Default
    private List<Product> products = new ArrayList<>();

    @OneToMany(mappedBy = "category")
    @Builder.Default
    private List<Supplier> suppliers = new ArrayList<>();
}

package com.eps.enterprise_procurement_system.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "budget", uniqueConstraints = @UniqueConstraint(
                name = "uq_budget_department_year",
                columnNames = {"department_id", "fiscal_year"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false, foreignKey = @ForeignKey(name = "fk_budget_department"))
    private Department department;

    @Column(name = "fiscal_year", nullable = false)
    private Integer fiscalYear;

    @Column(name = "allocated_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal allocatedAmount;

    @Column(name = "utilized_amount", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal utilizedAmount = BigDecimal.ZERO;
}

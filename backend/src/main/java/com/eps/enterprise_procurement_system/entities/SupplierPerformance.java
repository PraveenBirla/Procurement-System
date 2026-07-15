package com.eps.enterprise_procurement_system.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "supplier_performance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false, foreignKey = @ForeignKey(name = "fk_supplier_perf_supplier"))
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", foreignKey = @ForeignKey(name = "fk_supplier_perf_po"))
    private PurchaseOrder purchaseOrder;

    @Column(name = "quality_rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal qualityRating;

    @Column(name = "delivery_rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal deliveryRating;

    @Column(name = "price_rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal priceRating;

    @Column(name = "overall_rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal overallRating;

    @Column(name = "review_date", nullable = false)
    private LocalDate reviewDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by", foreignKey = @ForeignKey(name = "fk_supplier_perf_reviewer"))
    private User reviewedBy;
}

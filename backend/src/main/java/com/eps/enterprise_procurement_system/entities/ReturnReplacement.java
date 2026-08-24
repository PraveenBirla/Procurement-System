package com.eps.enterprise_procurement_system.entities;

import com.eps.enterprise_procurement_system.entities.enums.ReturnStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "return_replacement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnReplacement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", nullable = false, foreignKey = @ForeignKey(name = "fk_return_po"))
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goods_receipt_id", foreignKey = @ForeignKey(name = "fk_return_goods_receipt"))
    private GoodsReceipt goodsReceipt;

    @Lob
    @Column(name = "reason", nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ReturnStatus status = ReturnStatus.RAISED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raised_by", foreignKey = @ForeignKey(name = "fk_return_raised_by"))
    private User raisedBy;

    @Column(name = "raised_at", nullable = false, updatable = false)
    private LocalDateTime raisedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        this.raisedAt = LocalDateTime.now();
    }
}


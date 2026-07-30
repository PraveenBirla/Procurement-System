package com.eps.enterprise_procurement_system.entities;

import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_order_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @Enumerated(EnumType.STRING)
    private PurchaseOrderStatus oldStatus;

    @Enumerated(EnumType.STRING)
    private PurchaseOrderStatus newStatus;

    @ManyToOne
    @JoinColumn(name = "changed_by")
    private User changedBy;

    private String remarks;

    private LocalDateTime changedAt;
}

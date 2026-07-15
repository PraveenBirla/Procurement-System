package com.eps.enterprise_procurement_system.entities;

import com.eps.enterprise_procurement_system.entities.enums.QualityStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "goods_receipt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoodsReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", nullable = false, foreignKey = @ForeignKey(name = "fk_goods_receipt_po"))
    private PurchaseOrder purchaseOrder;

    @Column(name = "is_delayed", nullable = false)
    @Builder.Default
    private Boolean isDelayed = false;

    @Column(name = "received_date")
    private LocalDate receivedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "quality_status", nullable = false, length = 20)
    @Builder.Default
    private QualityStatus qualityStatus = QualityStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspected_by", foreignKey = @ForeignKey(name = "fk_goods_receipt_inspected_by"))
    private User inspectedBy;

    @Column(name = "inspected_at")
    private LocalDateTime inspectedAt;

    @Lob
    @Column(name = "remarks")
    private String remarks;

    @OneToMany(mappedBy = "goodsReceipt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GoodsReceiptItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "goodsReceipt")
    @Builder.Default
    private List<ReturnReplacement> returnReplacements = new ArrayList<>();
}


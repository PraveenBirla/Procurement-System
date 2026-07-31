package com.eps.enterprise_procurement_system.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "goods_receipt_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoodsReceiptItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goods_receipt_id", nullable = false, foreignKey = @ForeignKey(name = "fk_gr_item_receipt"))
    private GoodsReceipt goodsReceipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_gr_item_product"))
    private Product product;

    @Column(name = "received_quantity", nullable = false)
    @Builder.Default
    private Integer receivedQuantity = 0;

    @Column(name = "accepted_quantity", nullable = false)
    @Builder.Default
    private Integer  acceptedQuantity = 0;

    @Column(name = "rejected_quantity", nullable = false)
    @Builder.Default
    private Integer rejectedQuantity = 0;

    @Column(name="ordered_quantity")
    private Integer orderedQuantity;

    @Lob
    @Column(name = "remarks")
    private String remarks;
}


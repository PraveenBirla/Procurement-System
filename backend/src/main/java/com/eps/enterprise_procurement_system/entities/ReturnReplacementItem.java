package com.eps.enterprise_procurement_system.entities;

import com.eps.enterprise_procurement_system.entities.enums.ReturnIssueType;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "return_replacement_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnReplacementItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "return_replacement_id",
            nullable = false
    )
    private ReturnReplacement returnReplacement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "goods_receipt_item_id",
            nullable = false
    )
    private GoodsReceiptItem goodsReceiptItem;

    @Column(nullable = false)
    private Integer expectedQuantity;

    @Column(nullable = false)
    private Integer receivedQuantity;

    @Column(nullable = false)
    private Integer acceptedQuantity;

    @Column(nullable = false)
    @Builder.Default
    private Integer defectiveQuantity = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer shortageQuantity = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer extraQuantity = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReturnIssueType issueType;

    @Lob
    private String remarks;
}
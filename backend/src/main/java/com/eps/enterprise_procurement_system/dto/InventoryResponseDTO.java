package com.eps.enterprise_procurement_system.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InventoryResponseDTO {

    private Long id;

    private Long productId;

    private String productName;

    private Integer quantityOnHand;

    private String warehouseLocation;

    private Long lastPurchaseOrderId;

    private String purchaseOrderNo;

    private LocalDateTime updatedAt;
}
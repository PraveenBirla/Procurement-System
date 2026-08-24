package com.eps.enterprise_procurement_system.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReturnReplacementResponseDTO {

    private Long id;

    private Long purchaseOrderId;

    private Long goodsReceiptId;

    private String reason;

    private String status;

    private Long raisedBy;

    private LocalDateTime raisedAt;

    private LocalDateTime resolvedAt;

    private List<ReturnReplacementItemResponseDTO> items;
}
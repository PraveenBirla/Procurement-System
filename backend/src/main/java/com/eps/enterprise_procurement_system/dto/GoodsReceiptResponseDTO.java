package com.eps.enterprise_procurement_system.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class GoodsReceiptResponseDTO {

    private Long id;

    private String grnNumber;

    private Long purchaseOrderId;

    private String poNumber;

    private Boolean isDelayed;

    private LocalDate receivedDate;

    private String qualityStatus;

    private LocalDateTime inspectedAt;

    private Boolean allItemsPerfect;

    private List<GoodsReceiptItemResponseDTO> items;

    private String remarks;
}

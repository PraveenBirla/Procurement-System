package com.eps.enterprise_procurement_system.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class GoodsReceiptResponseDTO {

    private Long id;

    private String grnNumber;

    private Long purchaseOrderId;

    private String poNumber;

    private LocalDate receivedDate;

    private String receivedBy;

    private String remarks;
}

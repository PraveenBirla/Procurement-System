package com.eps.enterprise_procurement_system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;

import lombok.Data;

@Data
public class PurchaseOrderResponseDTO {

    private Long id;

    private String poNumber;

    private Long requisitionId;

    private String requisitionNo;

    private Long supplierId;

    private String supplierName;

    private PurchaseOrderStatus status;

    private BigDecimal totalAmount;

    private Long generatedById;

    private String generatedByName;

    private LocalDate expectedDeliveryDate;

    private LocalDateTime createdAt;

    private List<PoItemResponseDTO> items;

    private  String pdfURL;
}
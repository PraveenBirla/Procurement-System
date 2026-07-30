package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.PurchaseOrder;
import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PurchaseOrderHistoryResponseDTO {

    private Long id;

    private Long purchaseOrderId;

    private String poNumber;

    private PurchaseOrderStatus oldStatus;

    private PurchaseOrderStatus newStatus;

    private Long changedById;

    private String changedByName;

    private String remarks;

    private LocalDateTime changedAt;

}

package com.eps.enterprise_procurement_system.dto;

import lombok.Data;

@Data
public class GoodsReceiptItemResponseDTO {

    private Long id;

    private Long productId;

    private String productName;

    private Integer orderedQuantity;

    private Integer receivedQuantity;

    private Integer acceptedQuantity;

    private Integer rejectedQuantity;

    private Integer shortageQuantity;
    
    private Integer extraQuantity;

    private String remarks;
}

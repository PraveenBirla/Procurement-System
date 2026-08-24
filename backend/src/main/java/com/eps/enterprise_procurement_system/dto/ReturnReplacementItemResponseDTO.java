package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.ReturnIssueType;

import lombok.Data;

@Data
public class ReturnReplacementItemResponseDTO {

    private Long id;

    private Long goodsReceiptItemId;

    private String productName;

    private Integer expectedQuantity;

    private Integer receivedQuantity;

    private Integer acceptedQuantity;

    private Integer defectiveQuantity;

    private Integer shortageQuantity;

    private Integer extraQuantity;

    private ReturnIssueType issueType;

    private String remarks;
}
package com.eps.enterprise_procurement_system.dto;

import com.eps.enterprise_procurement_system.entities.enums.ReturnIssueType;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReturnReplacementItemRequestDTO {

    @NotNull
    private Long goodsReceiptItemId;

    @NotNull
    private Integer expectedQuantity;

    @NotNull
    private Integer receivedQuantity;

    @NotNull
    private Integer acceptedQuantity;

    private Integer defectiveQuantity;

    private Integer shortageQuantity;

    private Integer extraQuantity;

    @NotNull
    private ReturnIssueType issueType;

    private String remarks;
}

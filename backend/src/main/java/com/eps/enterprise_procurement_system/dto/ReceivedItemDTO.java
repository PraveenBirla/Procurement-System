package com.eps.enterprise_procurement_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceivedItemDTO {

    private Long productId;

    private Integer receivedQuantity;

    private Boolean damaged;

    private String remarks;
}

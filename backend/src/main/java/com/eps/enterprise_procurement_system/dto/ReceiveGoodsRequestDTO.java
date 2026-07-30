package com.eps.enterprise_procurement_system.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiveGoodsRequestDTO {

    private List<ReceivedItemDTO> items;
}
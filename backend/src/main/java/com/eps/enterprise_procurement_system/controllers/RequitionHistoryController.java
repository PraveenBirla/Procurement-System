package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.RequisitionStatusHistoryResponseDTO;
import com.eps.enterprise_procurement_system.services.HistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/history")
public class RequitionHistoryController {

    private final HistoryService historyService;

    public RequitionHistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping("/{requitionId}")
    public ResponseEntity<ApiResponse<List<RequisitionStatusHistoryResponseDTO>>> getRequitionsById(@PathVariable  Long requitionId){
          List<RequisitionStatusHistoryResponseDTO>  list= historyService. getHistoryByRequitionId(requitionId);

          return ResponseEntity.ok(new ApiResponse<>(list));
    }

}

package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.*;
import com.eps.enterprise_procurement_system.services.GoodsReceiptService;
import com.eps.enterprise_procurement_system.util.CurrentUser;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/goods-receipts")
@RequiredArgsConstructor
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;
    private final CurrentUser currentUser;

    @PostMapping("/purchase-order/{poId}")
    public ResponseEntity<ApiResponse<GoodsReceiptResponseDTO>>
    createGoodsReceipt(
            @PathVariable Long poId,
            @RequestBody GoodsReceiptRequestDTO dto) {

        GoodsReceiptResponseDTO response = goodsReceiptService.createGoodsReceipt(
                        poId,
                        dto,
                        currentUser.get()
                );

        return new ResponseEntity<>(new ApiResponse<>(response), HttpStatus.CREATED);
    }

    @GetMapping("/purchase-order/{poId}")
    public ResponseEntity<ApiResponse<GoodsReceiptResponseDTO>> getGoodsReceipt(
        @PathVariable Long poId) {

        return ResponseEntity.ok(
                new ApiResponse<>(goodsReceiptService.getByPurchaseOrder(poId))
        );
    }
}
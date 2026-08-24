package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.*;
import com.eps.enterprise_procurement_system.entities.*;
import com.eps.enterprise_procurement_system.entities.enums.ReturnStatus;
import com.eps.enterprise_procurement_system.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReturnReplacementService {

    private final ReturnReplacementRepo returnRepository;
    private final PurchaseOrderRepo purchaseOrderRepository;
    private final GoodsReceiptRepo goodsReceiptRepository;

    @Transactional
    public ReturnReplacementResponseDTO createReturn(
            ReturnReplacementRequestDTO dto,
            User currentUser) {

        PurchaseOrder po = purchaseOrderRepository.findById(dto.getPurchaseOrderId())
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));

        GoodsReceipt receipt = goodsReceiptRepository.findById(dto.getGoodsReceiptId())
                .orElseThrow(() -> new RuntimeException( "Goods receipt not found"));

        if (!receipt.getPurchaseOrder().getId().equals(po.getId())) {

            throw new RuntimeException(
                    "Goods receipt does not belong to this purchase order");
        }

        boolean hasRejectedItem = receipt.getItems()
                        .stream()
                        .anyMatch(item -> item.getRejectedQuantity() > 0
                        );

        if (!hasRejectedItem) {
            throw new RuntimeException(
                    "Return/replacement cannot be raised because no rejected item exists");
        }

        ReturnReplacement replacement = ReturnReplacement.builder()
                        .purchaseOrder(po)
                        .goodsReceipt(receipt)
                        .reason(dto.getReason())
                        .status(ReturnStatus.RAISED)
                        .raisedBy(currentUser)
                        .build();

        ReturnReplacement saved = returnRepository.save(replacement);

        return mapToDTO(saved);
    }

    public ReturnReplacementResponseDTO getById(Long id) {

        ReturnReplacement replacement = returnRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Return/replacement not found"));

        return mapToDTO(replacement);
    }

    private ReturnReplacementResponseDTO mapToDTO(ReturnReplacement entity) {

        ReturnReplacementResponseDTO dto = new ReturnReplacementResponseDTO();

        dto.setId(entity.getId());

        dto.setPurchaseOrderId(entity.getPurchaseOrder().getId());

        dto.setGoodsReceiptId(entity.getGoodsReceipt().getId());

        dto.setReason(entity.getReason());

        dto.setStatus(entity.getStatus().name());

        if (entity.getRaisedBy() != null) {
            dto.setRaisedBy(entity.getRaisedBy().getId());
        }

        dto.setRaisedAt(entity.getRaisedAt());
        dto.setResolvedAt(entity.getResolvedAt());

        return dto;
    }
}
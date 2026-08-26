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

        for (ReturnReplacementItemRequestDTO itemDTO : dto.getItems()) {

            GoodsReceiptItem receiptItem = receipt.getItems()
                    .stream()
                    .filter(item ->
                            item.getId()
                                    .equals(itemDTO.getGoodsReceiptItemId()))
                    .findFirst()
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Goods receipt item does not belong to this receipt"));

            int expected = itemDTO.getExpectedQuantity();
            int received = itemDTO.getReceivedQuantity();
            int accepted = itemDTO.getAcceptedQuantity();

            int defective =
                    itemDTO.getDefectiveQuantity() != null
                            ? itemDTO.getDefectiveQuantity()
                            : 0;

            int shortage =
                    itemDTO.getShortageQuantity() != null
                            ? itemDTO.getShortageQuantity()
                            : 0;

            int extra =
                    itemDTO.getExtraQuantity() != null
                            ? itemDTO.getExtraQuantity()
                            : 0;

            int calculatedShortage =
                    Math.max(expected - received, 0);

            int calculatedExtra =
                    Math.max(received - expected, 0);

            if (shortage != calculatedShortage) {
                throw new RuntimeException(
                        "Invalid shortage quantity");
            }

            if (extra != calculatedExtra) {
                throw new RuntimeException(
                        "Invalid extra quantity");
            }

            if (received < 0 || accepted < 0 || defective < 0) {

                throw new RuntimeException(
                        "Quantities cannot be negative");
            }

            if (defective > received) {
                throw new RuntimeException(
                        "Defective quantity cannot exceed received quantity");
            }

            if (accepted + defective > received) {
                throw new RuntimeException(
                        "Accepted and defective quantity cannot exceed received quantity");
            }

            if (defective == 0 && shortage == 0 && extra == 0) {
                throw new RuntimeException(
                        "No return or replacement issue found for this item");
            }

            ReturnReplacementItem item =
                    ReturnReplacementItem.builder()
                            .returnReplacement(replacement)
                            .goodsReceiptItem(receiptItem)
                            .expectedQuantity(expected)
                            .receivedQuantity(received)
                            .acceptedQuantity(accepted)
                            .defectiveQuantity(defective)
                            .shortageQuantity(shortage)
                            .extraQuantity(extra)
                            .issueType(itemDTO.getIssueType())
                            .remarks(itemDTO.getRemarks())
                            .build();

            replacement.getItems().add(item);
        }

        po.setStatus(PurchaseOrderStatus.RETURN_INITIATED);

        purchaseOrderRepository.save(po);

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
package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.*;
import com.eps.enterprise_procurement_system.entities.*;
import com.eps.enterprise_procurement_system.entities.enums.NotificationType;
import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;
import com.eps.enterprise_procurement_system.entities.enums.ReturnStatus;
import com.eps.enterprise_procurement_system.repositories.*;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReturnReplacementService {

    private final ReturnReplacementRepo returnRepository;
    private final PurchaseOrderRepo purchaseOrderRepository;
    private final GoodsReceiptRepo goodsReceiptRepository;
    private final NotificationService notificationService;

    /**
     * Procurement/Admin raises a return/replacement request.
     */
    @Transactional
    public ReturnReplacementResponseDTO createReturn(
            ReturnReplacementRequestDTO dto,
            User currentUser) {

        PurchaseOrder po = purchaseOrderRepository
                .findById(dto.getPurchaseOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Purchase order not found"));

        PurchaseRequisition req = po.getRequisition();

        GoodsReceipt receipt = goodsReceiptRepository
                .findById(dto.getGoodsReceiptId())
                .orElseThrow(() ->
                        new RuntimeException("Goods receipt not found"));

        if (!receipt.getPurchaseOrder().getId().equals(po.getId())) {
            throw new RuntimeException(
                    "Goods receipt does not belong to this purchase order");
        }

        /*
         * A return/replacement should only be raised after delivery.
         */
        if (po.getStatus() != PurchaseOrderStatus.DELIVERED) {
            throw new RuntimeException(
                    "Return/replacement can only be raised for a delivered purchase order");
        }

        /*
         * Prevent duplicate active return/replacement requests.
         */
        List<ReturnReplacement> existingRequests =
                returnRepository.findByPurchaseOrderId(po.getId());

        boolean activeRequest = existingRequests.stream()
                .anyMatch(r ->
                        r.getStatus() != ReturnStatus.RESOLVED &&
                        r.getStatus() != ReturnStatus.REJECTED
                );

        if (activeRequest) {
            throw new RuntimeException(
                    "An active return/replacement request already exists for this purchase order");
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

        notificationService.notify(
                po.getSupplier(),
                req,
                po,
                NotificationType.RETURN_REPLACEMENT,
                "Return / Replacement raised for PO "
                        + po.getPoNumber()
        );

        return mapToDTO(saved);
    }

    /**
     * Get all return/replacement requests for a PO.
     */
    @Transactional(readOnly = true)
    public List<ReturnReplacementResponseDTO> getByPurchaseOrder(
            Long poId) {

        return returnRepository
                .findByPurchaseOrderId(poId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Get one return/replacement request.
     */
    @Transactional(readOnly = true)
    public ReturnReplacementResponseDTO getById(Long id) {

        ReturnReplacement replacement =
                returnRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Return/replacement not found"));

        return mapToDTO(replacement);
    }

    /**
     * Supplier gets their pending return/replacement requests.
     */
    @Transactional(readOnly = true)
    public List<ReturnReplacementResponseDTO>
    getPendingSupplierReturns(Long sup_id) {

        return returnRepository
                .findByPurchaseOrderSupplierIdAndStatusIn(
                        sup_id,
                        List.of(
                                ReturnStatus.RAISED,
                                ReturnStatus.UNDER_REVIEW,
                                ReturnStatus.RETURN_APPROVED,
                                ReturnStatus.REPLACEMENT_APPROVED,
                                ReturnStatus.REPLACEMENT_DISPATCHED,
                                ReturnStatus.REPLACEMENT_DELIVERED
                        )
                )
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Supplier updates the return/replacement status.
     */
    @Transactional
    public ReturnReplacementResponseDTO updateSupplierStatus(
            Long returnId,
            ReturnStatus newStatus,
            User currentUser) {

        ReturnReplacement replacement =
                returnRepository.findById(returnId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Return/replacement not found"));

        PurchaseOrder po =
                replacement.getPurchaseOrder();

        /*
         * Make sure the logged-in supplier actually owns this PO.
         */
        if (po.getSupplier() == null ||
                po.getSupplier().getUser() == null ||
                !po.getSupplier()
                        .getUser()
                        .getId()
                        .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "You are not authorized to update this return/replacement");
        }

        ReturnStatus currentStatus = replacement.getStatus();

        validateSupplierTransition(
                currentStatus,
                newStatus
        );

        replacement.setStatus(newStatus);

        /*
         * Update PO status according to return/replacement progress.
         */
        updatePurchaseOrderStatus(
                po,
                newStatus
        );

        if (newStatus == ReturnStatus.RESOLVED ||
                newStatus == ReturnStatus.REJECTED) {

            replacement.setResolvedAt(
                    LocalDateTime.now()
            );
        }

        purchaseOrderRepository.save(po);

        ReturnReplacement saved =
                returnRepository.save(replacement);

        /*
         * Notify procurement/admin about supplier action.
         */
        if (po.getRequisition() != null) {

            notificationService.notify(
                    po.getGeneratedBy(),
                    po.getRequisition(),
                    po,
                    NotificationType.RETURN_REPLACEMENT,
                    "Return / Replacement status updated to "
                            + newStatus
            );
        }

        return mapToDTO(saved);
    }

    /**
     * Allowed supplier status transitions.
     */
    private void validateSupplierTransition(
            ReturnStatus current,
            ReturnStatus next) {

        boolean valid = false;

        switch (current) {

            case RAISED:

                valid =
                        next == ReturnStatus.UNDER_REVIEW ||
                        next == ReturnStatus.REJECTED;

                break;

            case UNDER_REVIEW:

                valid =
                        next == ReturnStatus.RETURN_APPROVED ||
                        next == ReturnStatus.REPLACEMENT_APPROVED ||
                        next == ReturnStatus.REJECTED;

                break;

            case RETURN_APPROVED:

                /*
                 * For a normal return, supplier can mark it resolved
                 * after receiving/processing the returned goods.
                 */
                valid =
                        next == ReturnStatus.RESOLVED;

                break;

            case REPLACEMENT_APPROVED:

                valid =
                        next == ReturnStatus.REPLACEMENT_DISPATCHED;

                break;

            case REPLACEMENT_DISPATCHED:

                valid =
                        next == ReturnStatus.REPLACEMENT_DELIVERED;

                break;

            case REPLACEMENT_DELIVERED:

                valid =
                        next == ReturnStatus.RESOLVED;

                break;

            case RESOLVED:
            case REJECTED:

                valid = false;

                break;
        }

        if (!valid) {

            throw new RuntimeException(
                    "Invalid return/replacement status transition: "
                            + current
                            + " -> "
                            + next);
        }
    }

    /**
     * Synchronize PurchaseOrderStatus with ReturnStatus.
     */
    private void updatePurchaseOrderStatus(PurchaseOrder po, ReturnStatus returnStatus) {

        switch (returnStatus) {

            case RAISED:

                po.setStatus(
                        PurchaseOrderStatus.RETURN_INITIATED
                );

                break;

            case UNDER_REVIEW:

                po.setStatus(
                        PurchaseOrderStatus.RETURN_INITIATED
                );

                break;

            case RETURN_APPROVED:

                /*
                 * No dedicated RETURN_APPROVED PO status exists.
                 * Keep PO in return workflow.
                 */
                po.setStatus(
                        PurchaseOrderStatus.RETURN_INITIATED
                );

                break;

            case REPLACEMENT_APPROVED:

                po.setStatus(
                        PurchaseOrderStatus.REPLACEMENT_PENDING
                );

                break;

            case REPLACEMENT_DISPATCHED:

                po.setStatus(
                        PurchaseOrderStatus.REPLACEMENT_PENDING
                );

                break;

            case REPLACEMENT_DELIVERED:

                po.setStatus(
                        PurchaseOrderStatus.REPLACEMENT_RECEIVED
                );

                break;

            case RESOLVED:

                po.setStatus(
                        PurchaseOrderStatus.COMPLETED
                );

                break;

            case REJECTED:

                /*
                 * If supplier rejects the request, there is no
                 * separate RETURN_REJECTED PO status.
                 *
                 * The PO can go back to DELIVERED because the
                 * original delivery remains valid.
                 */
                po.setStatus(
                        PurchaseOrderStatus.DELIVERED
                );

                break;
        }
    }

    private ReturnReplacementResponseDTO mapToDTO(
            ReturnReplacement entity) {

        ReturnReplacementResponseDTO dto =
                new ReturnReplacementResponseDTO();

        dto.setId(entity.getId());

        dto.setPurchaseOrderId(
                entity.getPurchaseOrder().getId());

        dto.setGoodsReceiptId(
                entity.getGoodsReceipt().getId());

        dto.setReason(entity.getReason());

        dto.setStatus(
                entity.getStatus().name());

        if (entity.getRaisedBy() != null) {

            dto.setRaisedBy(
                    entity.getRaisedBy().getId());
        }

        dto.setRaisedAt(
                entity.getRaisedAt());

        dto.setResolvedAt(
                entity.getResolvedAt());

        List<ReturnReplacementItemResponseDTO> itemDTOs =
                entity.getItems()
                        .stream()
                        .map(item -> {

                            ReturnReplacementItemResponseDTO itemDTO =
                                    new ReturnReplacementItemResponseDTO();

                            itemDTO.setId(
                                    item.getId());

                            itemDTO.setGoodsReceiptItemId(
                                    item.getGoodsReceiptItem().getId());

                            if (item.getGoodsReceiptItem()
                                    .getProduct() != null) {

                                itemDTO.setProductName(
                                        item.getGoodsReceiptItem()
                                                .getProduct()
                                                .getName());
                            }

                            itemDTO.setExpectedQuantity(
                                    item.getExpectedQuantity());

                            itemDTO.setReceivedQuantity(
                                    item.getReceivedQuantity());

                            itemDTO.setAcceptedQuantity(
                                    item.getAcceptedQuantity());

                            itemDTO.setDefectiveQuantity(
                                    item.getDefectiveQuantity());

                            itemDTO.setShortageQuantity(
                                    item.getShortageQuantity());

                            itemDTO.setExtraQuantity(
                                    item.getExtraQuantity());

                            itemDTO.setIssueType(
                                    item.getIssueType());

                            itemDTO.setRemarks(
                                    item.getRemarks());

                            return itemDTO;
                        })
                        .toList();

        dto.setItems(itemDTOs);

        return dto;
    }
}
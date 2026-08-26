package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.*;
import com.eps.enterprise_procurement_system.entities.*;
import com.eps.enterprise_procurement_system.entities.enums.QualityStatus;
import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;
import com.eps.enterprise_procurement_system.repositories.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoodsReceiptService {

    private final GoodsReceiptRepo goodsReceiptRepository;
    private final PurchaseOrderRepo purchaseOrderRepository;
    private final ProductRepo productRepository;
    private final PdfService pdfService;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public GoodsReceiptResponseDTO createGoodsReceipt(
            Long purchaseOrderId,
            GoodsReceiptRequestDTO dto,
            User currentUser) {

        PurchaseOrder po = purchaseOrderRepository.findById(purchaseOrderId)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));

        if (po.getStatus() != PurchaseOrderStatus.DELIVERED) {
            throw new RuntimeException(
                    "Goods receipt can only be created for DELIVERED purchase orders");
        }

        if (goodsReceiptRepository.findByPurchaseOrder_Id(purchaseOrderId).isPresent()) {

            throw new RuntimeException(
                    "Goods receipt already exists for this purchase order");
        }

        GoodsReceipt receipt = GoodsReceipt.builder()
                .goodsReceiptNumber(generateReceiptNumber())
                .purchaseOrder(po)
                .isDelayed(false)
                .receivedDate(LocalDate.now())
                .qualityStatus(QualityStatus.PENDING)
                .inspectedBy(currentUser)
                .inspectedAt(LocalDateTime.now())
                .remarks(dto.getRemarks())
                .build();

        List<GoodsReceiptItem> receiptItems = new ArrayList<>();

        for (var poItem : po.getPoItems()) {

            var requestItem = dto.getItems()
                    .stream()
                    .filter(item -> item.getProductId()
                                    .equals(poItem.getProduct().getId()))
                    .findFirst()
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Missing goods receipt item for product "
                                            + poItem.getProduct().getName()));

            int ordered = poItem.getQuantity();
            int received = requestItem.getReceivedQuantity();
            int accepted = requestItem.getAcceptedQuantity();
            int rejected = requestItem.getRejectedQuantity();

            if (received != accepted + rejected) {
                throw new RuntimeException(
                        "Received quantity must equal accepted + rejected quantity");
            }

            GoodsReceiptItem item = GoodsReceiptItem.builder()
                    .goodsReceipt(receipt)
                    .product(poItem.getProduct())
                    .orderedQuantity(ordered)
                    .receivedQuantity(received)
                    .acceptedQuantity(accepted)
                    .rejectedQuantity(rejected)
                    .remarks(requestItem.getRemarks())
                    .build();

            receiptItems.add(item);
        }

        receipt.setItems(receiptItems);

        boolean perfect = receiptItems.stream()
                .allMatch(item ->
                        item.getReceivedQuantity().equals(item.getOrderedQuantity()) &&
                        item.getAcceptedQuantity().equals(item.getOrderedQuantity()) &&
                        item.getRejectedQuantity() == 0
                );

        receipt.setQualityStatus(perfect? QualityStatus.PASS: QualityStatus.FAIL);

        GoodsReceipt saved = goodsReceiptRepository.save(receipt);

        byte[] pdfBytes = pdfService.generateGoodsReceipt(saved);

        String url = cloudinaryService.uploadFile(pdfBytes,
                    "goods-receipt" + saved.getGoodsReceiptNumber());
        saved.setPdfURL(url);
        po.setGoodsReceiptURL(url);
        
        purchaseOrderRepository.save(po);

        return mapToDTO(saved, perfect);
    }

    public GoodsReceiptResponseDTO getByPurchaseOrder(Long purchaseOrderId) {

        GoodsReceipt receipt = goodsReceiptRepository
                        .findByPurchaseOrder_Id(purchaseOrderId)
                        .orElseThrow(() ->
                                new RuntimeException("Goods receipt not found"));

        boolean perfect = isPerfect(receipt);

        return mapToDTO(receipt, perfect);
    }

    private boolean isPerfect(GoodsReceipt receipt) {

        return receipt.getItems()
                .stream()
                .allMatch(item -> item.getReceivedQuantity().equals(item.getOrderedQuantity()) &&
                        item.getAcceptedQuantity().equals(item.getOrderedQuantity()) &&
                        item.getRejectedQuantity() == 0
                );
    }

    private String generateReceiptNumber() {

        return "GR-" + System.currentTimeMillis();
    }

    private GoodsReceiptResponseDTO mapToDTO(GoodsReceipt receipt, boolean perfect) {

        GoodsReceiptResponseDTO dto = new GoodsReceiptResponseDTO();

        dto.setId(receipt.getId());
        dto.setGrnNumber(receipt.getGoodsReceiptNumber());

        dto.setPurchaseOrderId(receipt.getPurchaseOrder().getId());

        dto.setPoNumber(receipt.getPurchaseOrder().getPoNumber());

        dto.setIsDelayed(receipt.getIsDelayed());

        dto.setReceivedDate(receipt.getReceivedDate());

        dto.setQualityStatus(receipt.getQualityStatus().name());

        dto.setInspectedAt(receipt.getInspectedAt());

        dto.setRemarks(receipt.getRemarks());

        dto.setAllItemsPerfect(perfect);

        List<GoodsReceiptItemResponseDTO> items =
                receipt.getItems()
                        .stream()
                        .map(item -> {
                            GoodsReceiptItemResponseDTO i = new GoodsReceiptItemResponseDTO();

                            i.setId(item.getId());
                            i.setProductId(item.getProduct().getId());

                            i.setProductName(item.getProduct().getName());

                            i.setOrderedQuantity(item.getOrderedQuantity());

                            i.setReceivedQuantity(item.getReceivedQuantity());

                            i.setAcceptedQuantity(item.getAcceptedQuantity());

                            i.setRejectedQuantity(item.getRejectedQuantity());

                            i.setRemarks(item.getRemarks());
                            
                            i.setShortageQuantity(item.getShortageQuantity());
                                        
                            i.setExtraQuantity(item.getExtraQuantity());

                            return i;
                        })
                        .toList();

        dto.setItems(items);

        return dto;
    }
}
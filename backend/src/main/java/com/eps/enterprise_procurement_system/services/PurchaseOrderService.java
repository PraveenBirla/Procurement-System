package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.*;
import com.eps.enterprise_procurement_system.entities.*;
import com.eps.enterprise_procurement_system.entities.enums.NotificationType;
import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import com.eps.enterprise_procurement_system.entities.enums.ReturnStatus;
import com.eps.enterprise_procurement_system.repositories.*;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {
    private final PurchaseOrderRepo purchaseOrderRepo;
    private final PurchaseRequisitionRepo requisitionRepo;
    private final SupplierRepo supplierRepo;
    private final InventoryRepo inventoryRepo;
    private final UserRepository userRepo;
    private final PdfService pdfService;
    private final ExcelService excelService;
    private final ReturnReplacementRepo returnReplacementRepo;
    private final GoodsReceiptRepo goodsReceiptRepo;

    private final NotificationService notificationService;
    private final AuditService auditService;
    private final PurchaseOrderHistoryRepo historyRepo;

    private String generatePONumber() {

        return "PO-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }

    private PurchaseRequisition getRequisition(Long requisitionId) {

        return requisitionRepo.findById(requisitionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Requisition not found"));
    }

    private Supplier getSupplier(Long supplierId) {

        return supplierRepo.findById(supplierId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Supplier not found"));
    }

    private Inventory getInventory(Product product) {

        return inventoryRepo.findByProduct_Id(product.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Inventory not found for " + product.getName()));
    }

    private BigDecimal calculateTotal(PurchaseRequisition requisition) {

        return requisition.getItems()
                .stream()
                .map(item -> item.getUnitPrice().multiply(
                        BigDecimal.valueOf(
                                item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void notifyStakeholders(PurchaseOrder order) {

        userRepo.findAll()
                .stream()
                .filter(user -> user.getRole().name().equals("ADMIN") ||
                        user.getRole().name().equals("FINANCE"))
                .forEach(user -> notificationService.notify(
                        user,
                        order.getRequisition(),
                        order,
                        NotificationType.APPROVAL,
                        "Purchase Order " + order.getPoNumber() + " generated."));
    }

    private PurchaseOrderResponseDTO convertToDTO(PurchaseOrder purchaseOrder) {

        PurchaseOrderResponseDTO dto = new PurchaseOrderResponseDTO();

        dto.setId(purchaseOrder.getId());
        dto.setPoNumber(purchaseOrder.getPoNumber());

        dto.setRequisitionId(purchaseOrder.getRequisition().getId());

        dto.setRequisitionNo(purchaseOrder.getRequisition().getRequisitionNo());

        dto.setSupplierId(purchaseOrder.getSupplier().getId());

        dto.setSupplierName(purchaseOrder.getSupplier().getName());

        dto.setStatus(purchaseOrder.getStatus());

        dto.setTotalAmount(purchaseOrder.getTotalAmount());

        dto.setExpectedDeliveryDate(purchaseOrder.getExpectedDeliveryDate());

        dto.setCreatedAt(purchaseOrder.getCreatedAt());

        if (purchaseOrder.getGeneratedBy() != null) {
            dto.setGeneratedById(purchaseOrder.getGeneratedBy().getId());
            dto.setGeneratedByName(purchaseOrder.getGeneratedBy().getFullName());
        }

        dto.setItems(purchaseOrder.getPoItems()
                .stream()
                .map(item -> {
                    PoItemResponseDTO itemDTO = new PoItemResponseDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setProductId(item.getProduct().getId());
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setUnitPrice(item.getUnitPrice());
                    itemDTO.setTotalPrice(item.getUnitPrice()
                            .multiply(
                                    java.math.BigDecimal.valueOf(item.getQuantity())));
                    return itemDTO;
                }).toList());

        return dto;
    }

    public List<PurchaseOrderResponseDTO> getAllPurchaseOrders() {

        return purchaseOrderRepo.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public PurchaseOrderResponseDTO getPurchaseOrderById(Long id) {

        PurchaseOrder order = purchaseOrderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Purchase Order not found"));

        return convertToDTO(order);
    }

    public List<PurchaseOrderResponseDTO> getPurchaseOrdersByStatus(PurchaseOrderStatus status) {

        return purchaseOrderRepo.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<PurchaseOrderResponseDTO> getSupplierOrders(Long supplierId) {

        return purchaseOrderRepo.findBySupplier_Id(supplierId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<PurchaseOrderResponseDTO> getGeneratedOrders(Long userId) {

        return purchaseOrderRepo.findByGeneratedBy_Id(userId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<PurchaseOrderHistoryResponseDTO> getPurchaseOrderHistory(Long poId) {

        return historyRepo.findByPurchaseOrderIdOrderByChangedAtAsc(poId)
                .stream()
                .map(this::convertHistoryToDTO)
                .toList();
    }

    @Transactional
    public PurchaseOrderResponseDTO generatePurchaseOrder(
            PurchaseOrderRequestDTO dto,
            User procurementOfficer) {

        // Fetch Approved Requisition
        PurchaseRequisition requisition = getRequisition(dto.getRequisitionId());

        // Only approved requisitions can generate PO
        if (requisition.getStatus() != RequisitionStatus.APPROVED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Purchase Order can be generated only for APPROVED requisitions");
        }

        // Prevent duplicate PO generation
        if (purchaseOrderRepo.existsByRequisition_Id(requisition.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Purchase Order already exists for this requisition");
        }

        // Fetch Supplier
        Supplier supplier = getSupplier(dto.getSupplierId());

        // Supplier must be active
        if (!supplier.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supplier is inactive");
        }

        // Supplier should belong to same category
        for (var item : requisition.getItems()) {

            if (!item.getProduct()
                    .getCategory()
                    .getId()
                    .equals(supplier.getCategory().getId())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Supplier does not supply category : "
                                + item.getProduct()
                                        .getCategory()
                                        .getCategoryName());
            }
        }

        // Create Purchase Order
        PurchaseOrder purchaseOrder = PurchaseOrder.builder()
                .poNumber(generatePONumber())
                .requisition(requisition)
                .supplier(supplier)
                .generatedBy(procurementOfficer)
                .expectedDeliveryDate(dto.getExpectedDeliveryDate())
                .status(PurchaseOrderStatus.GENERATED)
                .totalAmount(calculateTotal(requisition))
                .build();
        for (var reqItem : requisition.getItems()) {

            Inventory inventory = getInventory(reqItem.getProduct());


            if (inventory.getQuantityOnHand() >= reqItem.getQuantity()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        reqItem.getProduct().getName()
                                + " already has sufficient inventory."
                                + " No purchase required.");
            }

            // Remaining quantity to purchase
            int purchaseQty = reqItem.getQuantity() - inventory.getQuantityOnHand();
            PoItem poItem = PoItem.builder()
                    .purchaseOrder(purchaseOrder)
                    .product(reqItem.getProduct())
                    .quantity(purchaseQty)
                    .unitPrice(reqItem.getUnitPrice())
                    .build();

            purchaseOrder.getPoItems().add(poItem);
        }

        PurchaseOrder saved = purchaseOrderRepo.save(purchaseOrder);

        requisition.setStatus(RequisitionStatus.PO_GENERATED);

        requisitionRepo.save(requisition);
        notificationService.notify(
                supplier,
                requisition,
                saved,
                NotificationType.PURCHASE_ORDER,
                "Purchase Order " + saved.getPoNumber() + " has been generated.");

        notifyStakeholders(saved);

        notificationService.notify(
                requisition.getEmployee(),
                requisition,
                saved,
                NotificationType.PURCHASE_ORDER,
                "Purchase Order " + saved.getPoNumber() + " has been generated for your requisition.");

        auditService.log(
                "PurchaseOrder",
                saved.getId(),
                "CREATE",
                procurementOfficer,
                "Purchase Order Generated");

        return convertToDTO(saved);
    }

    @Transactional
    public PurchaseOrderResponseDTO updateStatus(Long orderId, PurchaseOrderStatus status, User user) {

        PurchaseOrder order = purchaseOrderRepo.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Purchase Order not found"));

        PurchaseOrderStatus oldStatus = order.getStatus();

        order.setStatus(status);

        PurchaseOrder saved = purchaseOrderRepo.save(order);



        notificationService.notify(
                saved.getSupplier(),
                saved.getRequisition(),
                saved,
                NotificationType.PURCHASE_ORDER,
                "Purchase Order " + saved.getPoNumber() + " status changed to " + status);

        auditService.log(
                "PurchaseOrder",
                saved.getId(),
                "STATUS_UPDATE",
                user,
                status.name());

        return convertToDTO(saved);
    }

    @Transactional
    public String cancelPurchaseOrder(Long id, User user) {
        PurchaseOrder order = purchaseOrderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Purchase Order not found"));

        if (order.getStatus() == PurchaseOrderStatus.PO_RECEIVED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Received Purchase Order cannot be cancelled");
        }

        order.setStatus(PurchaseOrderStatus.CANCELLED);

        purchaseOrderRepo.save(order);

        notificationService.notify(
                order.getSupplier(),
                order.getRequisition(),
                order,
                NotificationType.PURCHASE_ORDER,
                "Purchase Order " + order.getPoNumber() + " has been cancelled.");

        auditService.log(
                "PurchaseOrder",
                order.getId(),
                "CANCEL",
                user,
                "Purchase Order Cancelled");
        return "Cancelled Purchase Order";
    }

    @Transactional
    public String deletePurchaseOrder(Long id) {

        PurchaseOrder order = purchaseOrderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Purchase Order not found"));

        purchaseOrderRepo.delete(order);
        return "Purchase Order Deleted Successfully";
    }

    private void createReturn(PurchaseOrder order, GoodsReceipt receipt, String reason, User user){

        ReturnReplacement rr = ReturnReplacement.builder()
                        .purchaseOrder(order)
                        .goodsReceipt(receipt)
                        .reason(reason)
                        .raisedBy(user)
                        .status(ReturnStatus.RAISED)
                        .build();

        returnReplacementRepo.save(rr);
    }

    @Transactional
    public byte[] receiveGoods(Long poId, ReceiveGoodsRequestDTO dto, User warehouseUser) {

        PurchaseOrder order = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Purchase Order not found"));

        if (order.getStatus() != PurchaseOrderStatus.DELIVERED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Purchase Order not ready for receiving");
        }

        boolean hasIssue = false;
        Map<Long, ReceivedItemDTO> receivedMap = dto.getItems()
                .stream()
                .collect(Collectors.toMap(
                        ReceivedItemDTO::getProductId,
                        Function.identity()));

        for (PoItem poItem : order.getPoItems()) {

            ReceivedItemDTO received = receivedMap.get(poItem.getProduct().getId());

            if (received == null) {

                createReturn(order,
                        null,
                        "Product missing",
                        warehouseUser);

                hasIssue = true;
                continue;
            }

            if (received.getReceivedQuantity() < poItem.getQuantity()) {

                createReturn(
                        order,
                        null,
                        "Short quantity for " + poItem.getProduct().getName(),
                        warehouseUser);

                hasIssue = true;
            }

            if (Boolean.TRUE.equals(received.getDamaged())) {

                createReturn(
                        order,
                        null,
                        "Damaged item : " + poItem.getProduct().getName(),
                        warehouseUser);

                hasIssue = true;
            }
        }

        if (hasIssue) {

            order.setStatus(PurchaseOrderStatus.RETURN_INITIATED);

            purchaseOrderRepo.save(order);

            auditService.log(
                    "PurchaseOrder",
                    order.getId(),
                    "RETURN_INITIATED",
                    warehouseUser,
                    "Inspection Failed");

            notificationService.notify(
                    order.getSupplier(),
                    null,
                    order,
                    NotificationType.RETURN,
                    "Replacement requested for " + order.getPoNumber());

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Inspection failed. Replacement Requested");
        }

        for (PoItem item : order.getPoItems()) {

            Inventory inventory = inventoryRepo.findByProduct_Id(item.getProduct().getId()).orElseThrow();

            inventory.setQuantityOnHand(inventory.getQuantityOnHand() + item.getQuantity());

            inventory.setLastPurchaseOrder(order);

            inventoryRepo.save(inventory);
        }
        GoodsReceipt receipt = GoodsReceipt.builder()
                .purchaseOrder(order)
                .inspectedBy(warehouseUser)
                .receivedDate(LocalDate.now())
                .remarks("Inspection Passed")
                .build();

        goodsReceiptRepo.save(receipt);

        order.setStatus(PurchaseOrderStatus.PO_RECEIVED);

        purchaseOrderRepo.save(order);

        auditService.log(
                "PurchaseOrder",
                order.getId(),
                "PO_RECEIVED",
                warehouseUser,
                "All goods verified");

        return pdfService.generateGoodsReceipt(order);
    }

    //Pdfs and excels
    public byte[] generatePurchaseOrderPdf(Long poId) {

        PurchaseOrder order = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Purchase Order not found"));

        return pdfService.generatePurchaseOrder(order);
    }

    public byte[] generateInvoice(Long poId) {

        PurchaseOrder order = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Purchase Order not found"));

        if (order.getStatus() != PurchaseOrderStatus.PO_RECEIVED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invoice can be generated only after goods are received");
        }

        return pdfService.generateInvoice(order);
    }

    public byte[] exportPurchaseOrders() {

        List<PurchaseOrder> orders = purchaseOrderRepo.findAll();

        return excelService.exportPurchaseOrders(orders);
    }

    public byte[] exportPurchaseOrdersByStatus(PurchaseOrderStatus status) {

        List<PurchaseOrder> orders = purchaseOrderRepo.findByStatus(status);

        return excelService.exportPurchaseOrders(orders);
    }

    public byte[] exportSupplierOrders(Long supplierId) {

        List<PurchaseOrder> orders = purchaseOrderRepo.findBySupplier_Id(supplierId);

        return excelService.exportPurchaseOrders(orders);
    }

    public byte[] exportGeneratedOrders(Long userId) {

        List<PurchaseOrder> orders = purchaseOrderRepo.findByGeneratedBy_Id(userId);

        return excelService.exportPurchaseOrders(orders);
    }

    private PurchaseOrderHistoryResponseDTO convertHistoryToDTO(PurchaseOrderHistory history) {

        return PurchaseOrderHistoryResponseDTO.builder()
                .id(history.getId())
                .purchaseOrderId(history.getPurchaseOrder().getId())
                .poNumber(history.getPurchaseOrder().getPoNumber())
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .changedById(history.getChangedBy().getId())
                .changedByName(history.getChangedBy().getFullName())
                .remarks(history.getRemarks())
                .changedAt(history.getChangedAt())
                .build();
    }

//    @Transactional
//    public PurchaseOrderResponseDTO updateHIstoryStatus(
//            Long poId,
//            PurchaseOrderStatus newStatus,
//            String remarks,
//            User user) {
//
//        PurchaseOrder po = purchaseOrderRepo.findById(poId)
//                .orElseThrow();
//
//        PurchaseOrderStatus oldStatus = po.getStatus();
//
//        po.setStatus(newStatus);
//
//        purchaseOrderRepo.save(po);
//
//        historyRepo.save(
//                PurchaseOrderHistory.builder()
//                        .purchaseOrder(po)
//                        .oldStatus(oldStatus)
//                        .newStatus(newStatus)
//                        .changedBy(user)
//                        .remarks(remarks)
//                        .changedAt(LocalDateTime.now())
//                        .build());
//
//        return  convertToDTO(po);
//    }

    
}

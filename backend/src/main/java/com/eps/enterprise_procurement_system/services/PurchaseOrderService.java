package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.*;
import com.eps.enterprise_procurement_system.entities.*;
import com.eps.enterprise_procurement_system.entities.enums.NotificationType;
import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;
import com.eps.enterprise_procurement_system.entities.enums.QualityStatus;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import com.eps.enterprise_procurement_system.entities.enums.ReturnStatus;
import com.eps.enterprise_procurement_system.repositories.*;

import com.eps.enterprise_procurement_system.util.CurrentUser;
import lombok.RequiredArgsConstructor;

import org.jspecify.annotations.Nullable;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {
        private final PurchaseOrderRepo purchaseOrderRepo;
        private final PoItemRepo poItemRepo;
        private final PurchaseOrderStateMachine stateMachine;
        private final PurchaseRequisitionRepo requisitionRepo;
        private final SupplierRepo supplierRepo;
        private final InventoryRepo inventoryRepo;
        private final UserRepository userRepo;
        private final PdfService pdfService;
        private final ExcelService excelService;
        private final ReturnReplacementRepo returnReplacementRepo;
        private final GoodsReceiptRepo goodsReceiptRepo;
        private final ModelMapper modelMapper;
        private final PurchaseOrderHistoryRepo purchaseOrderHistoryRepo;
        private final NotificationService notificationService;
        private final AuditService auditService;
        private final RequisitionStatusHistoryRepo historyRepo;
        private  final  CloudinaryService cloudinaryService;
        private final  CurrentUser currentUser;


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


                dto.setStatus(purchaseOrder.getStatus());

                dto.setTotalAmount(purchaseOrder.getTotalAmount());

                dto.setPdfURL(purchaseOrder.getPdfURL());

                dto.setInvoiceURL(purchaseOrder.getInvoiceURL());

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

        public List<PurchaseOrderResponseDTO> getSupplierOrders() {

            Supplier supplier = supplierRepo.findByUserId(currentUser.get().getId())
                    .orElseThrow(() -> new RuntimeException("supplier not found"));

                return purchaseOrderRepo.findBySupplier_Id(supplier.getId())
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

        private BigDecimal calculateTotal(List<RequisitionItem> selectedItems) {

                return selectedItems.stream()
                        .map(item -> {

                                if (item.getUnitPrice() == null) {
                                throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Unit price is not available for product : "
                                                + item.getProduct().getName());
                                }

                                return item.getUnitPrice()
                                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                        })
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                }

        @Transactional
        public PurchaseOrderResponseDTO generatePurchaseOrder(
                PurchaseOrderRequestDTO dto, User procurementOfficer) {


                PurchaseRequisition requisition = getRequisition(dto.getRequisitionId());

                // Validate delivery date is in future
                if (dto.getExpectedDeliveryDate() != null &&
                dto.getExpectedDeliveryDate().isBefore(LocalDate.now())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Expected delivery date must be in the future");
                }

                // Only approved requisitions can generate PO
                if (requisition.getStatus() != RequisitionStatus.APPROVED
                && requisition.getStatus() != RequisitionStatus.PARTIALLY_ORDERED) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Purchase Order can be generated only for APPROVED requisitions");
                }

                // Fetch Supplier
                Supplier supplier = getSupplier(dto.getSupplierId());

                // Supplier must be active
                if (!supplier.getIsActive()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supplier is inactive");
                }

                // Prevent duplicate PO generation
                if (purchaseOrderRepo.existsByRequisition_Id(requisition.getId()) && requisition.getStatus()!=RequisitionStatus.PARTIALLY_ORDERED) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Purchase Order already exists for this requisition");
                }

                if (dto.getPoItems() == null || dto.getPoItems().isEmpty()) {

                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Please select requisition items.");
                }

                List<RequisitionItem> selectedItems = new ArrayList<>();

                for (PoItemRequestDTO itemDTO : dto.getPoItems()) {

                        RequisitionItem reqItem = requisition.getItems()
                                .stream()
                                .filter(i -> i.getId() == itemDTO.getRequisitionItemId())
                                .findFirst()
                                .orElseThrow(() ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Requisition Item not found : "
                                                        + itemDTO.getRequisitionItemId()));
                if (poItemRepo.existsByRequisitionItem_Id(reqItem.getId())) {

                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                reqItem.getProduct().getName()
                                        + " is already included in another Purchase Order.");
                        }

                        if (!reqItem.getProduct()
                                .getCategory()
                                .getId()
                                .equals(supplier.getCategory().getId())) {

                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                supplier.getUser().getFullName() + " cannot supply " + reqItem.getProduct().getName());
                        }

                        selectedItems.add(reqItem);
                }

                if (selectedItems.isEmpty()) {

                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "All selected products are already available in inventory.");
                }

                PurchaseOrder purchaseOrder = PurchaseOrder.builder()
                        .poNumber(generatePONumber())
                        .requisition(requisition)
                        .supplier(supplier)
                        .generatedBy(procurementOfficer)
                        .expectedDeliveryDate(dto.getExpectedDeliveryDate())
                        .status(PurchaseOrderStatus.GENERATED)
                        .totalAmount(calculateTotal(selectedItems))
                        .build();

                for (RequisitionItem reqItem : selectedItems) {

                        PoItem poItem = PoItem.builder()
                                .purchaseOrder(purchaseOrder)
                                .requisitionItem(reqItem)     // if this relation exists
                                .product(reqItem.getProduct())
                                .quantity(reqItem.getQuantity())
                                .unitPrice(reqItem.getUnitPrice())
                                .totalPrice(
                                        reqItem.getUnitPrice()
                                                .multiply(BigDecimal.valueOf(reqItem.getQuantity())))
                                .build();

                        purchaseOrder.getPoItems().add(poItem);
                }

                PurchaseOrder saved = purchaseOrderRepo.save(purchaseOrder);

               byte[] pdfBytes = pdfService.generatePurchaseOrder(saved);

               String url = cloudinaryService.uploadFile(pdfBytes,  "purchase-order-" + saved.getPoNumber()) ;
               saved.setPdfURL(url);

                boolean allOrdered = requisition.getItems()
                        .stream()
                        .allMatch(item ->
                                poItemRepo.existsByRequisitionItem_Id(item.getId()));

                if (allOrdered) {
                        requisition.setStatus(RequisitionStatus.PO_GENERATED);
                } else {
                        requisition.setStatus(RequisitionStatus.PARTIALLY_ORDERED);
                }

                requisitionRepo.save(requisition);

            historyRepo.save(RequisitionStatusHistory.builder()
                    .requisition(requisition)
                    .oldStatus(requisition.getStatus())
                    .newStatus(RequisitionStatus.PO_GENERATED)
                    .changedBy(procurementOfficer)
                    .remarks("purchase order generated")
                    .build()
            );

            savePurchaseOrderHistory(purchaseOrder, PurchaseOrderStatus.GENERATED,  procurementOfficer);

                notificationService.notify(
                        supplier,
                        requisition,
                        saved,
                        NotificationType.PURCHASE_ORDER,
                        "Purchase Order " + saved.getPoNumber() + " has been generated.");

                notificationService.notify(
                        requisition.getEmployee(),
                        requisition,
                        saved,
                        NotificationType.PURCHASE_ORDER,
                        "Purchase Order " + saved.getPoNumber()
                                + " has been generated.");

                notifyStakeholders(saved);

                auditService.log(
                        "PurchaseOrder",
                        saved.getId(),
                        "CREATE",
                        procurementOfficer,
                        "Purchase Order Generated");

                return convertToDTO(saved);
        }



        private void applyTransitionLogic(PurchaseOrder order, PurchaseOrderStatus from, PurchaseOrderStatus to, User user) {

                switch (to) {
                        case DELIVERED:
                                // Record delivery timestamp
                                order.setDeliveredAt(LocalDateTime.now());
                                break;

                        case COMPLETED:
                                // Mark as successfully completed
                                order.setCompletedAt(LocalDateTime.now());
                                order.setCompletedBy(user);
                                break;

                        case RETURN_INITIATED:
                                // Log inspection failure
                                auditService.log("PurchaseOrder", order.getId(), "INSPECTION_FAILED", user,
                                                "Quality issues detected");
                                break;

                        case CANCELLED:
                                // Mark cancellation details
                                order.setCancelledAt(LocalDateTime.now());
                                order.setCancelledBy(user);
                                notificationService.notify(order.getGeneratedBy(), order.getRequisition(), order,
                                                NotificationType.PURCHASE_ORDER, "Order Cancelled");
                                break;

                        case REPLACEMENT_PENDING:
                                // Increment replacement count
                                order.setReplacementCount(order.getReplacementCount() + 1);
                                break;
                        
                        default:
                                break;
                }
        }

        @Transactional
        public PurchaseOrderResponseDTO updateStatus(Long orderId, PurchaseOrderStatus newStatus, User user) {

                PurchaseOrder order = purchaseOrderRepo.findById(orderId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Purchase Order not found"));
                
                PurchaseOrderStatus currentStatus = order.getStatus();

                if (!stateMachine.isValidTransition(currentStatus, newStatus)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid status transition from " + currentStatus + " to " + newStatus + 
                        ". Valid transitions: " + stateMachine.getValidNextStatuses(currentStatus));
                }

                // Apply business logic based on transition
                applyTransitionLogic(order, currentStatus, newStatus, user);


                order.setStatus(newStatus);
                PurchaseOrder saved = purchaseOrderRepo.save(order);

                savePurchaseOrderHistory(saved, saved.getStatus(),user);

                // Notify stakeholders
                String reason = stateMachine.getTransitionReason(currentStatus, newStatus);
                notificationService.notify(
                        saved.getSupplier(),
                        saved.getRequisition(),
                        saved,
                        NotificationType.PURCHASE_ORDER,
                        "Purchase Order " + saved.getPoNumber() + " " + reason);

                auditService.log(
                        "PurchaseOrder",
                        saved.getId(),
                        "STATUS_TRANSITION",
                        user,
                        currentStatus + " → " + newStatus);

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
        public byte[] receiveGoods(Long poId, List<GoodsReceiptItemRequestDTO> items,
                                User warehouseUser) {

                PurchaseOrder order = purchaseOrderRepo.findById(poId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Purchase Order not found"));

                if (order.getStatus() != PurchaseOrderStatus.DELIVERED) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Purchase Order is not ready for receiving.");
                }

                Map<Long, GoodsReceiptItemRequestDTO> receivedItems =
                        items.stream().collect(Collectors.toMap(
                                GoodsReceiptItemRequestDTO::getProductId,
                                Function.identity()));

                boolean hasIssue = false;

                GoodsReceipt receipt = GoodsReceipt.builder()
                        .goodsReceiptNumber("REQ-" + UUID.randomUUID().toString().replace("-", "").toUpperCase().substring(0, 8))
                        .purchaseOrder(order)
                        .receivedDate(LocalDate.now())
                        .inspectedBy(warehouseUser)
                        .inspectedAt(LocalDateTime.now())
                        .qualityStatus(QualityStatus.PASS)
                        .remarks("Inspection Completed")
                        .build();

                goodsReceiptRepo.save(receipt);

                List<GoodsReceiptItem> receiptItems = new ArrayList<>();

                for (PoItem poItem : order.getPoItems()) {

                        GoodsReceiptItemRequestDTO dto = receivedItems.get(poItem.getProduct().getId());

                        if (dto == null) {

                                createReturn(
                                        order,
                                        receipt,
                                        "Product not received : " + poItem.getProduct().getName(),
                                        warehouseUser);

                                hasIssue = true;
                                continue;
                        }

                        if (dto.getAcceptedQuantity() + dto.getRejectedQuantity() != dto.getReceivedQuantity()) {

                                throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Accepted + Rejected quantity must equal Received quantity for "
                                                + poItem.getProduct().getName());
                        }

                        GoodsReceiptItem receiptItem =
                                GoodsReceiptItem.builder()
                                        .goodsReceipt(receipt)
                                        .product(poItem.getProduct())
                                        .orderedQuantity(poItem.getQuantity())
                                        .receivedQuantity(dto.getReceivedQuantity())
                                        .acceptedQuantity(dto.getAcceptedQuantity())
                                        .rejectedQuantity(dto.getRejectedQuantity())
                                        .remarks(dto.getRemarks())
                                        .build();

                        receiptItems.add(receiptItem);

                        int ordered = poItem.getQuantity();
                        int received = dto.getReceivedQuantity();

                        if (received < ordered) {

                                createReturn(
                                        order,
                                        receipt,
                                        "Short quantity. Ordered " + ordered + " but received " + received + " for "
                                                + poItem.getProduct().getName(),
                                        warehouseUser);

                                hasIssue = true;
                        }

                        if (received > ordered) {

                                createReturn(
                                        order,
                                        receipt,
                                        "Overshipment. Ordered "
                                                + ordered
                                                + " but received "
                                                + received
                                                + " for "
                                                + poItem.getProduct().getName(),
                                        warehouseUser);

                                hasIssue = true;
                        }

                        if (dto.getRejectedQuantity() > 0) {

                                createReturn(
                                        order,
                                        receipt,
                                        dto.getRejectedQuantity() + " defective units of " + poItem.getProduct().getName(),
                                        warehouseUser);

                                hasIssue = true;
                        }

                        Inventory inventory = inventoryRepo.findByProduct_Id(poItem.getProduct().getId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,"Inventory not found"));

                        inventory.setQuantityOnHand(inventory.getQuantityOnHand() + dto.getAcceptedQuantity());

                        inventory.setLastPurchaseOrder(order);

                        inventoryRepo.save(inventory);
                }

                receipt.setItems(receiptItems);

                receipt.setQualityStatus(hasIssue ? QualityStatus.FAIL : QualityStatus.PASS);

                receipt.setRemarks(hasIssue ? "Inspection completed with issues" : "Inspection passed");

                goodsReceiptRepo.save(receipt);

                if (hasIssue) {

                        order.setStatus(PurchaseOrderStatus.RETURN_INITIATED);

                        purchaseOrderRepo.save(order);

                        auditService.log(
                                "PurchaseOrder",
                                order.getId(),
                                "RETURN_INITIATED",
                                warehouseUser,
                                "Inspection failed");

                        notificationService.notify(
                                order.getSupplier(),
                                null,
                                order,
                                NotificationType.RETURN,
                                "Replacement/Return required for "
                                        + order.getPoNumber());

                } 
                else {

                        order.setStatus(PurchaseOrderStatus.COMPLETED);

                        purchaseOrderRepo.save(order);

                        auditService.log(
                                "PurchaseOrder",
                                order.getId(),
                                "GOODS_RECEIVED",
                                warehouseUser,
                                "Inspection successful");

                        notificationService.notify(
                                order.getGeneratedBy(),
                                null,
                                order,
                                NotificationType.PURCHASE_ORDER,
                                "Goods received successfully for " + order.getPoNumber());
                }

                return pdfService.generateGoodsReceipt(receipt);
        }

        public List<PurchaseOrderHistoryResponseDTO> getHistory(Long poId) {

                if(purchaseOrderRepo.existsById(poId)){
                        List<PurchaseOrderHistory> historyList = purchaseOrderHistoryRepo
                                .findByPurchaseOrderIdOrderByChangedAtAsc(poId);
                        return historyList.stream().map(
                                history ->
                                     PurchaseOrderHistoryResponseDTO.builder()
                                             .id(history.getId())
                                             .purchaseOrderId(history.getPurchaseOrder().getId())
                                             .poNumber(history.getPurchaseOrder().getPoNumber())
                                             .changedById(history.getChangedBy().getId())
                                             .changedAt(history.getChangedAt())
                                             .oldStatus(history.getOldStatus())
                                             .newStatus(history.getNewStatus())
                                             .changedByName(history.getChangedBy().getFullName())
                                             .remarks(history.getRemarks())
                                             .changedAt(history.getChangedAt())
                                             .build()
                        ).toList();
                }
                else {
                        throw new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Purchase Order not found");
                }
                
        }

        public PurchaseOrderResponseDTO getPurchaseOrderByRequisitionId(Long reqId) {

                PurchaseOrder order = purchaseOrderRepo.findByRequisition_Id(reqId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Purchase Order with this requisition not found"));

                return convertToDTO(order);
        }


        public byte[] generatePurchaseOrderPdf(Long poId) {

                PurchaseOrder order = purchaseOrderRepo.findById(poId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Purchase Order not found"));

                return pdfService.generatePurchaseOrder(order);
        }

        @Transactional
        public  PurchaseOrderResponseDTO generateInvoice(Long poId) {

                PurchaseOrder order = purchaseOrderRepo.findById(poId)
                                 .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Purchase Order not found"));

                if (order.getStatus() != PurchaseOrderStatus.PO_RECEIVED) {

                        throw new ResponseStatusException(
                                         HttpStatus.BAD_REQUEST, "Invoice can be generated only after goods are received");
                }

                byte[] pdf =  pdfService.generateInvoice(order);

                String url = cloudinaryService.uploadFile(pdf,"Invoice" + order.getRequisition().getId());

                order.setStatus(PurchaseOrderStatus.IN_DELIVERY);
                order.setInvoiceURL(url);

                purchaseOrderRepo.save(order);

                savePurchaseOrderHistory(order,PurchaseOrderStatus.IN_DELIVERY, currentUser.get());

                return convertToDTO(order);
        }

        public byte[] exportPoItems(Long poId) {

                PurchaseOrder order = purchaseOrderRepo.findById(poId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Purchase Order not found"));

                return excelService.exportPOItems(order);
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

        public void savePurchaseOrderHistory(PurchaseOrder purchaseOrder, PurchaseOrderStatus status, User changedBy){
               PurchaseOrderHistory history = new PurchaseOrderHistory();

               history.setPurchaseOrder(purchaseOrder);
               history.setOldStatus(purchaseOrder.getStatus());
               history.setNewStatus(status);
               history.setChangedBy(changedBy);
               history.setChangedAt(LocalDateTime.now());

               purchaseOrderHistoryRepo.save(history);
        }

        @Transactional
    public  void sendToSupplier(Long id ) {

        PurchaseOrder po = purchaseOrderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Purchase Order not found"));

        if (po.getStatus() != PurchaseOrderStatus.GENERATED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Purchase Order is already sent");
        }

        PurchaseRequisition requisition =  requisitionRepo.findById(po.getRequisition().getId())
                 .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "requisition not found"));
                ;

          requisition.setStatus(RequisitionStatus.SENT_TO_SUPPLIER);

        po.setStatus(PurchaseOrderStatus.SENT_TO_SUPPLIER);
        purchaseOrderRepo.save(po);
        savePurchaseOrderHistory(po , PurchaseOrderStatus.SENT_TO_SUPPLIER, currentUser.get());
        requisitionRepo.save(requisition);
    }

    public List<PurchaseOrderResponseDTO> getSupplierPurchaseOrdersByStatus(

            PurchaseOrderStatus status) {

            Supplier supplier = supplierRepo.findByUserId(currentUser.get().getId())
                    .orElseThrow(() -> new RuntimeException("Suplier Not Found"));

        return purchaseOrderRepo
                .findBySupplierIdAndStatus(supplier.getId(), status)
                .stream()
                .map(this::convertToDTO)
                .toList();

    }
}

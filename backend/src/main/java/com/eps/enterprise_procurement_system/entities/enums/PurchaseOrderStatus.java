package com.eps.enterprise_procurement_system.entities.enums;

public enum PurchaseOrderStatus {
    GENERATED,
    SENT_TO_SUPPLIER,
    PO_RECEIVED,
    IN_DELIVERY,
    DELIVERED,
    COMPLETED,
    RETURN_INITIATED,
    REPLACEMENT_PENDING,
    REPLACEMENT_RECEIVED,
    PARTIALLY_RECEIVED,
    CANCELLED
}

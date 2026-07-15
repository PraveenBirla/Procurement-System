package com.eps.enterprise_procurement_system.entities.enums;

public enum RequisitionStatus {
    DRAFT,
    SUBMITTED,
    DUPLICATE_FLAGGED,
    PENDING_MANAGER,
    MANAGER_REJECTED,
    PENDING_FINANCE,
    FINANCE_REJECTED,
    PENDING_ADMIN,
    ADMIN_REJECTED,
    APPROVED,
    SOURCING,
    PO_GENERATED,
    CANCELLED
}
package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.entities.enums.PurchaseOrderStatus;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class PurchaseOrderStateMachine {

    private static final Map<PurchaseOrderStatus, Set<PurchaseOrderStatus>> VALID_TRANSITIONS = 
        Map.ofEntries(
            Map.entry(PurchaseOrderStatus.PO_GENERATED, Set.of(
                PurchaseOrderStatus.SENT_TO_SUPPLIER,
                PurchaseOrderStatus.CANCELLED
            )),
            
            Map.entry(PurchaseOrderStatus.SENT_TO_SUPPLIER, Set.of(
                PurchaseOrderStatus.PO_RECEIVED,
                PurchaseOrderStatus.CANCELLED
            )),
            
            Map.entry(PurchaseOrderStatus.PO_RECEIVED, Set.of(
                PurchaseOrderStatus.IN_DELIVERY,
                PurchaseOrderStatus.CANCELLED
            )),
            
            Map.entry(PurchaseOrderStatus.IN_DELIVERY, Set.of(
                PurchaseOrderStatus.DELIVERED
            )),
            
            Map.entry(PurchaseOrderStatus.DELIVERED, Set.of(
                PurchaseOrderStatus.COMPLETED,           // All items received & passed inspection
                PurchaseOrderStatus.PARTIALLY_RECEIVED,   // Received less than ordered
                PurchaseOrderStatus.RETURN_INITIATED      // Quality issues detected
            )),
            
            Map.entry(PurchaseOrderStatus.PARTIALLY_RECEIVED, Set.of(
                PurchaseOrderStatus.COMPLETED,             // Remaining items arrived
                PurchaseOrderStatus.REPLACEMENT_PENDING    // Request replacement for shortage
            )),
            
            Map.entry(PurchaseOrderStatus.RETURN_INITIATED, Set.of(
                PurchaseOrderStatus.REPLACEMENT_PENDING
            )),
            
            Map.entry(PurchaseOrderStatus.REPLACEMENT_PENDING, Set.of(
                PurchaseOrderStatus.REPLACEMENT_RECEIVED
            )),
            
            Map.entry(PurchaseOrderStatus.REPLACEMENT_RECEIVED, Set.of(
                PurchaseOrderStatus.COMPLETED,            // Replacement passed inspection
                PurchaseOrderStatus.RETURN_INITIATED      // Replacement also defective
            )),
            
            // Terminal states - no transitions allowed
            Map.entry(PurchaseOrderStatus.COMPLETED, Collections.emptySet()),
            Map.entry(PurchaseOrderStatus.CANCELLED, Collections.emptySet())
        );

    /**
     * Validates if a transition from current to target status is allowed
     */
    public boolean isValidTransition(PurchaseOrderStatus currentStatus, PurchaseOrderStatus targetStatus) {
        if (currentStatus == null || targetStatus == null) {
            return false;
        }
        Set<PurchaseOrderStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());
        return allowed.contains(targetStatus);
    }

    /**
     * Get all valid next statuses from current status
     */
    public Set<PurchaseOrderStatus> getValidNextStatuses(PurchaseOrderStatus currentStatus) {
        return VALID_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());
    }

    /**
     * Check if status is terminal (no further transitions)
     */
    public boolean isTerminalStatus(PurchaseOrderStatus status) {
        return VALID_TRANSITIONS.getOrDefault(status, Collections.emptySet()).isEmpty();
    }

    /**
     * Get human-readable reason for transition
     */
    public String getTransitionReason(PurchaseOrderStatus from, PurchaseOrderStatus to) {
        return switch (to) {
            case SENT_TO_SUPPLIER -> "Purchase order sent to supplier";
            case PO_RECEIVED -> "Purchase order confirmed by supplier";
            case IN_DELIVERY -> "Goods dispatched from supplier";
            case DELIVERED -> "Goods arrived at warehouse";
            case COMPLETED -> "Goods received and inspected successfully";
            case PARTIALLY_RECEIVED -> "Partial goods received, remaining items pending";
            case RETURN_INITIATED -> "Quality issues detected, return initiated";
            case REPLACEMENT_PENDING -> "Replacement items requested and pending";
            case REPLACEMENT_RECEIVED -> "Replacement items received";
            case CANCELLED -> "Purchase order cancelled";
            default -> "Status changed to " + to;
        };
    }
}
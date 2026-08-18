package com.eps.enterprise_procurement_system.services;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.eps.enterprise_procurement_system.entities.Notification;
import com.eps.enterprise_procurement_system.entities.PurchaseOrder;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.NotificationType;
import com.eps.enterprise_procurement_system.repositories.NotificationRepo;
import com.eps.enterprise_procurement_system.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.eps.enterprise_procurement_system.dto.NotificationDTO;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final EmailService emailService;
    private final UserRepository userRepo;
    private final NotificationRepo repo;
    private final SimpMessagingTemplate messagingTemplate;

    public void notify(User user, PurchaseRequisition req, PurchaseOrder po, NotificationType type, String message) {
        Notification n = Notification.builder()
                .user(user).requisition(req).purchaseOrder(po).type(type).message(message).isRead(false).build();
        Notification saved = repo.save(n);
        
        // Broadcast over WebSocket
        NotificationDTO dto = NotificationDTO.builder()
                .id(saved.getId())
                .userId(user.getId())
                .requisitionId(req != null ? req.getId() : null)
                .purchaseOrderId(po != null ? po.getId() : null)
                .message(saved.getMessage())
                .type(saved.getType())
                .isRead(saved.getIsRead())
                .createdAt(saved.getCreatedAt())
                .build();
                
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), dto);

        if (user.getEmail() != null){
            emailService.send(user.getEmail(), "ProCure: " + type, message);
        }
    }

    public void notify(Supplier supplier, PurchaseRequisition req, PurchaseOrder po, NotificationType type, String message) {

        User supplierUser = supplier.getUser();

        if (supplierUser != null) {
            notify(supplierUser, req, po, type, message);
        } else {
            log.warn("Supplier {} has no linked user account — skipped notification: {}",
                    supplier.getId(), message);
        }
    }

    public List<Notification> listForUser(Long userId) {
        return repo.findByUser_IdOrderByCreatedAtDesc(userId);
    }
}


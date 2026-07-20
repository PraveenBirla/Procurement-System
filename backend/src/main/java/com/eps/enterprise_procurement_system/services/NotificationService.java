package com.eps.enterprise_procurement_system.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.eps.enterprise_procurement_system.entities.Notification;
import com.eps.enterprise_procurement_system.entities.PurchaseOrder;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.NotificationType;
import com.eps.enterprise_procurement_system.repositories.NotificationRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final EmailService emailService;
    private final NotificationRepo repo;

    public void notify(User user, PurchaseRequisition req, PurchaseOrder po, NotificationType type, String message) {
        Notification n = Notification.builder()
                .user(user).requisition(req).purchaseOrder(po).type(type).message(message).isRead(false).build();
        repo.save(n);
        if (user.getEmail() != null) emailService.send(user.getEmail(), "EPS: " + type, message);
    }

    public List<Notification> listForUser(Long userId) {
        return repo.findByUser_IdOrderByCreatedAtDesc(userId);
    }
}


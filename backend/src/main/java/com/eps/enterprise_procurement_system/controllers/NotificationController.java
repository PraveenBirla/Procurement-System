package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.NotificationDTO;
import com.eps.enterprise_procurement_system.entities.Notification;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.repositories.NotificationRepo;
import com.eps.enterprise_procurement_system.repositories.UserRepository;
import com.eps.enterprise_procurement_system.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepo notificationRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getMyNotifications(@AuthenticationPrincipal User user) {
        // Find notifications for user
        List<Notification> notifications = notificationService.listForUser(user.getId());

        // Filter out read notifications older than 4 hours
        LocalDateTime fourHoursAgo = LocalDateTime.now().minusHours(4);
        List<Notification> activeNotifications = notifications.stream()
                .filter(n -> !n.getIsRead() || n.getCreatedAt().isAfter(fourHoursAgo))
                .collect(Collectors.toList());

        List<NotificationDTO> dtos = activeNotifications.stream().map(n ->
                NotificationDTO.builder()
                        .id(n.getId())
                        .userId(n.getUser().getId())
                        .requisitionId(n.getRequisition() != null ? n.getRequisition().getId() : null)
                        .purchaseOrderId(n.getPurchaseOrder() != null ? n.getPurchaseOrder().getId() : null)
                        .message(n.getMessage())
                        .type(n.getType())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(dtos));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Notification notification = notificationRepo.findById(id).orElse(null);
        if (notification != null && notification.getUser().getId().equals(user.getId())) {
            notification.setIsRead(true);
            notificationRepo.save(notification);
        }
        return ResponseEntity.ok(new ApiResponse<>(null));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal User user) {
        List<Notification> notifications = notificationService.listForUser(user.getId());
        for (Notification n : notifications) {
            if (!n.getIsRead()) {
                n.setIsRead(true);
            }
        }
        notificationRepo.saveAll(notifications);
        return ResponseEntity.ok(new ApiResponse<>(null));
    }
}

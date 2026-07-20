package com.eps.enterprise_procurement_system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eps.enterprise_procurement_system.entities.Notification;

public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);
}

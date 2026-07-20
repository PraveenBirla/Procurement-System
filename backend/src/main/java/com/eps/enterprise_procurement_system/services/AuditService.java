package com.eps.enterprise_procurement_system.services;

import org.springframework.stereotype.Service;

import com.eps.enterprise_procurement_system.entities.AuditLog;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.repositories.AuditLogRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepo repo;
    public void log(String entityType, Long entityId, String action, User by, String details) {
        repo.save(AuditLog.builder()
                .entityType(entityType).entityId(entityId).action(action)
                .performedBy(by).details(details).build());
    }
}

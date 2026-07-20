package com.eps.enterprise_procurement_system.util;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.repositories.UserRepository;

@Component
@RequiredArgsConstructor
public class CurrentUser {
    private final UserRepository userRepository;
    public User get() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email);
    }
}

package com.eps.enterprise_procurement_system.entities;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.eps.enterprise_procurement_system.entities.enums.Role;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "user")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email" , unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "role")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_department"))
    private Department department;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, name = "created_at" )
    private LocalDateTime localDateTime;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return  this.email;
    }

    @Override
    public String getPassword() {
        return this.password;
    }
    
    @PrePersist
    protected void onCreate() {
        this.localDateTime = LocalDateTime.now();
    }   
}

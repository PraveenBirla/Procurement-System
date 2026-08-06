package com.eps.enterprise_procurement_system.entities;

import com.eps.enterprise_procurement_system.entities.enums.SupplierDocumentType;
import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_document")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    @JsonIgnore
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    private SupplierDocumentType documentType;

    private String fileName;

    private String fileUrl;

    private LocalDateTime uploadedAt;

}

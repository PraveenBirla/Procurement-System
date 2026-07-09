package com.eps.enterprise_procurement_system.entities;

import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_supplier_doc_supplier"))
    private Supplier supplier;

    @Column(name = "document_type", length = 50)
    private String documentType;

    @Column(name = "document_number", length = 100)
    private String documentNumber;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by", foreignKey = @ForeignKey(name = "fk_supplier_doc_verified_by"))
    private User verifiedBy;

    @Lob
    @Column(name = "remarks")
    private String remarks;
}

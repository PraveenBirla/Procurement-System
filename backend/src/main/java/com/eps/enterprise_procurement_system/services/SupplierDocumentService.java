package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.SupplierDocumentRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierDocumentResponseDTO;
import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.entities.SupplierDocument;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import com.eps.enterprise_procurement_system.repositories.SupplierDocumentRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierRepo;
import com.eps.enterprise_procurement_system.repositories.UserRepository;
import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierDocumentService {

    private final SupplierDocumentRepo supplierDocumentRepo;
    private final SupplierRepo supplierRepo;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    private SupplierDocumentResponseDTO convertToDTO(SupplierDocument document) {

        SupplierDocumentResponseDTO dto = modelMapper.map(document, SupplierDocumentResponseDTO.class);

        dto.setSupplierId(document.getSupplier().getId());
        dto.setSupplierName(document.getSupplier().getName());

        if (document.getVerifiedBy() != null) {
            dto.setVerifiedById(document.getVerifiedBy().getId());
            dto.setVerifiedByName(document.getVerifiedBy().getFullName());
        }

        return dto;
    }

    public SupplierDocumentResponseDTO createDocument(SupplierDocumentRequestDTO dto) {

        Supplier supplier = supplierRepo.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Supplier not found"));

        User verifiedBy = null;

        if (dto.getVerifiedById() != null) {
            verifiedBy = userRepository.findById(dto.getVerifiedById())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "User not found"));
        }

        SupplierDocument document = SupplierDocument.builder()
                .supplier(supplier)
                .documentType(dto.getDocumentType())
                .documentNumber(dto.getDocumentNumber())
                .fileName(dto.getFileName())
                .filePath(dto.getFilePath())
                .fileSize(dto.getFileSize())
                .contentType(dto.getContentType())
                .expiryDate(dto.getExpiryDate())
                .verificationStatus(
                        dto.getVerificationStatus() == null ? VerificationStatus.PENDING : dto.getVerificationStatus())
                .verifiedBy(verifiedBy)
                .remarks(dto.getRemarks())
                .build();

        SupplierDocument saved = supplierDocumentRepo.save(document);

        return convertToDTO(saved);
    }
    
    public List<SupplierDocumentResponseDTO> getAllDocuments() {

        return supplierDocumentRepo.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public SupplierDocumentResponseDTO getDocumentById(Long id) {

        SupplierDocument document = supplierDocumentRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        return convertToDTO(document);
    }

    public List<SupplierDocumentResponseDTO> getDocumentsBySupplier(Long supplierId) {

        return supplierDocumentRepo.findBySupplier_Id(supplierId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public SupplierDocumentResponseDTO updateDocument(Long id, SupplierDocumentRequestDTO dto) {

        SupplierDocument document = supplierDocumentRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Document not found"));

        document.setDocumentType(dto.getDocumentType());
        document.setDocumentNumber(dto.getDocumentNumber());
        document.setFileName(dto.getFileName());
        document.setFilePath(dto.getFilePath());
        document.setFileSize(dto.getFileSize());
        document.setContentType(dto.getContentType());
        document.setExpiryDate(dto.getExpiryDate());
        document.setRemarks(dto.getRemarks());

        SupplierDocument updated = supplierDocumentRepo.save(document);

        return convertToDTO(updated);
    }
    
    public SupplierDocumentResponseDTO verifyDocument(Long id, VerificationStatus status, User verifier, String remarks) {

        SupplierDocument document = supplierDocumentRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Document not found"));

        document.setVerificationStatus(status);
        document.setVerifiedBy(verifier);
        document.setRemarks(remarks);

        SupplierDocument updated = supplierDocumentRepo.save(document);

        return convertToDTO(updated);
    }
    
     public String deleteDocument(Long id) {

        SupplierDocument document = supplierDocumentRepo.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                        HttpStatus.NOT_FOUND, "Document not found"));

        supplierDocumentRepo.delete(document);

        return "Supplier document deleted successfully";
    }
}
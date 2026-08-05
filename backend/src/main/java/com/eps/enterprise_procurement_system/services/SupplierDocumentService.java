package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.SupplierDocumentRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierDocumentResponseDTO;
import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.entities.SupplierDocument;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.SupplierDocumentType;
import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import com.eps.enterprise_procurement_system.repositories.SupplierDocumentRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierRepo;
import com.eps.enterprise_procurement_system.util.CurrentUser;

import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierDocumentService {

    private final SupplierDocumentRepo supplierDocumentRepo;
    private final SupplierRepo supplierRepo;
    private final ModelMapper modelMapper;
    private final CurrentUser currentUser;
    private final CloudinaryService cloudinaryService;


    private SupplierDocumentResponseDTO convertToDTO(SupplierDocument document) {

        SupplierDocumentResponseDTO dto = modelMapper.map(document, SupplierDocumentResponseDTO.class);

        dto.setSupplierId(document.getSupplier().getId());
        dto.setSupplierName(document.getSupplier().getUser().getFullName());

        return dto;
    }

    public String uploadeDocument( SupplierDocumentType documentType,
                                   MultipartFile file){

        Supplier supplier =   supplierRepo.findByUserId(currentUser.get().getId())
                .orElseThrow(() -> new RuntimeException("Supplier Not Found"));

        String documentUrl = cloudinaryService.uploadDocs(file);

        SupplierDocument document = SupplierDocument.builder()
                .supplier(supplier)
                .documentType(documentType)
                .fileName(file.getOriginalFilename())
                .fileUrl(documentUrl)
                .uploadedAt(LocalDateTime.now())
                .build();

        supplierDocumentRepo.save(document);

        return "Document uploaded successfully";

    }

//    public SupplierDocumentResponseDTO createDocument(SupplierDocumentRequestDTO dto, User currentUser) {
//
//        if(supplierDocumentRepo.existsByDocumentTypeAndDocumentNumber(dto.getDocumentType(),
//            dto.getDocumentNumber())){
//
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Document already uploaded");
//        }
//
//        Supplier supplier = supplierRepo.findByUser_Id(currentUser.getId())
//                .orElseThrow(() -> new ResponseStatusException(
//                        HttpStatus.NOT_FOUND,
//                        "Supplier not found"));
//
//        if(dto.getExpiryDate()!=null && dto.getExpiryDate().isBefore(LocalDate.now())){
//
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Document already expired");
//        }
//
//        SupplierDocument document = SupplierDocument.builder()
//                .supplier(supplier)
//                .documentType(dto.getDocumentType())
//                .documentNumber(dto.getDocumentNumber())
//                .fileName(dto.getFileName())
//                .filePath(dto.getFilePath())
//                .fileSize(dto.getFileSize())
//                .contentType(dto.getContentType())
//                .expiryDate(dto.getExpiryDate())
//                .verificationStatus(VerificationStatus.PENDING)
//                .remarks(dto.getRemarks())
//                .build();
//
//        SupplierDocument saved = supplierDocumentRepo.save(document);
//
//        return convertToDTO(saved);
//    }
    
    public List<SupplierDocumentResponseDTO> getAllDocuments() {

        return supplierDocumentRepo.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<SupplierDocumentResponseDTO> getMyDocuments(User user){

        Supplier supplier = supplierRepo.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Supplier profile not found"));

        return supplierDocumentRepo.findBySupplier_Id(supplier.getId())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<SupplierDocumentResponseDTO> getDocumentsBySupplier(Long supplierId) {

        return supplierDocumentRepo.findBySupplier_Id(supplierId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

     @Transactional
    public String updateDocument(Long documentId, MultipartFile file) {

        SupplierDocument document = supplierDocumentRepo.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"));

        String fileUrl = cloudinaryService.uploadDocs(file);

        document.setFileName(file.getOriginalFilename());
        document.setFileUrl(fileUrl);
        document.setUploadedAt(LocalDateTime.now());

        supplierDocumentRepo.save(document);

        return "Document updated successfully";
    }

//    public SupplierDocumentResponseDTO updateDocument(Long id, SupplierDocumentRequestDTO dto, User currentUser) {
//
//        SupplierDocument document = supplierDocumentRepo.findById(id)
//                .orElseThrow(() -> new ResponseStatusException(
//                        HttpStatus.NOT_FOUND, "Document not found"));
//
//        Supplier supplier = supplierRepo.findByUser_Id(currentUser.getId())
//        .orElseThrow(() ->
//                new ResponseStatusException(
//                        HttpStatus.NOT_FOUND,
//                        "Supplier profile not found"));
//
//        if (!document.getSupplier().getId().equals(supplier.getId())) {
//            throw new ResponseStatusException(
//                    HttpStatus.FORBIDDEN,
//                    "You can update only your own documents");
//        }
//
//        document.setDocumentType(dto.getDocumentType());
//        document.setDocumentNumber(dto.getDocumentNumber());
//        document.setFileName(dto.getFileName());
//        document.setFilePath(dto.getFilePath());
//        document.setFileSize(dto.getFileSize());
//        document.setContentType(dto.getContentType());
//        document.setExpiryDate(dto.getExpiryDate());
//        document.setRemarks(dto.getRemarks());
//
//        SupplierDocument updated = supplierDocumentRepo.save(document);
//
//        return convertToDTO(updated);
//    }
//

//    public SupplierDocumentResponseDTO verifyDocument(Long id, VerificationStatus status, User verifier, String remarks) {
//
//        SupplierDocument document = supplierDocumentRepo.findById(id)
//                .orElseThrow(() -> new ResponseStatusException(
//                        HttpStatus.NOT_FOUND, "Document not found"));
//
//        document.setVerificationStatus(status);
//        document.setVerifiedBy(verifier);
//
//        String existing = document.getRemarks() == null ? "" : document.getRemarks();
//
//        document.setRemarks(existing + "\nVerification Remarks : " + remarks);
//
//        SupplierDocument updated = supplierDocumentRepo.save(document);
//
//        return convertToDTO(updated);
//    }
    
//    public String deleteDocument(Long id, User currUser) {
//
//        SupplierDocument document = supplierDocumentRepo.findById(id)
//                        .orElseThrow(() -> new ResponseStatusException(
//                        HttpStatus.NOT_FOUND, "Document not found"));
//        if (document.getVerificationStatus() == VerificationStatus.VERIFIED) {
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Verified document cannot be deleted");
//        }
//
//        Supplier supplier = supplierRepo.findByUser_Id(currUser.getId())
//                .orElseThrow(() -> new ResponseStatusException(
//                                HttpStatus.NOT_FOUND,
//                                "Supplier profile not found"));
//
//        if (!document.getSupplier().getId().equals(supplier.getId())) {
//            throw new ResponseStatusException(
//                    HttpStatus.FORBIDDEN,
//                    "You can delete only your own documents");
//        }
//
//        supplierDocumentRepo.delete(document);
//
//        return "Supplier document deleted successfully";
//    }
}
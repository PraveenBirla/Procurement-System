package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.DocumentVerificationRequestDTO;
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

    @Transactional
    public String updateVerificationStatus(Long documentId, DocumentVerificationRequestDTO request) {

        SupplierDocument document = supplierDocumentRepo
                .findById(documentId)
                .orElseThrow(() ->
                        new RuntimeException("Supplier document not found"));
                        
        VerificationStatus status = request.getStatus();

        // Update individual document
        document.setStatus(status);
        document.setRemarks(request.getRemarks());

        supplierDocumentRepo.save(document);

        if(document.getStatus()==VerificationStatus.VERIFIED)
            document.setVerifiedAt(LocalDateTime.now());
        // Get supplier
        Supplier supplier = document.getSupplier();

        // Get all supplier documents
        List<SupplierDocument> documents =
                supplierDocumentRepo.findBySupplier_Id(supplier.getId());

        // Determine supplier status
        VerificationStatus supplierStatus;

        boolean anyRejected = documents.stream()
                .anyMatch(doc ->
                        doc.getStatus() == VerificationStatus.REJECTED);

        boolean allVerified = !documents.isEmpty()
                && documents.stream()
                .allMatch(doc ->
                        doc.getStatus() == VerificationStatus.VERIFIED);

        if (anyRejected) {
            supplierStatus = VerificationStatus.REJECTED;
        } else if (allVerified) {
            supplierStatus = VerificationStatus.VERIFIED;
        } else {
            supplierStatus = VerificationStatus.PENDING;
        }

        // Update supplier status
        supplier.setStatus(supplierStatus);

        supplierRepo.save(supplier);

        return "Document status updated successfully";
    }

    @Transactional
    public void resetExpiredDocuments() {

        LocalDateTime expiryDate = LocalDateTime.now().minusYears(1);

        List<SupplierDocument> documents = supplierDocumentRepo.findByStatusAndVerifiedAtBefore(
                    VerificationStatus.VERIFIED,
                    expiryDate);

        for (SupplierDocument document : documents) {

            DocumentVerificationRequestDTO dto = DocumentVerificationRequestDTO.builder()
                    .remarks("Annual verification expired. Re-verification required.")
                    .status(VerificationStatus.EXPIRED).build();

            updateVerificationStatus(document.getId(), dto);
        }
    }

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
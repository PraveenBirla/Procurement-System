package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.AllSupplierResponseDTO;
import com.eps.enterprise_procurement_system.dto.SupplierRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierResponseDTO;
import com.eps.enterprise_procurement_system.entities.ProductCategory;
import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.entities.SupplierDocument;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.Role;
import com.eps.enterprise_procurement_system.repositories.ProductCategoryRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierDocumentRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierRepo;
import com.eps.enterprise_procurement_system.util.CurrentUser;

import lombok.RequiredArgsConstructor;

import org.apache.xmlbeans.impl.xb.xsdschema.NamedGroup;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepo supplierRepo;
    private final ProductCategoryRepo categoryRepo;
    private final ModelMapper modelMapper;
    private final CurrentUser currentUser;
    private final SupplierDocumentRepo supplierDocumentRepo;

    private SupplierResponseDTO convertToDTO(Supplier supplier) {

        SupplierResponseDTO dto = modelMapper.map(supplier, SupplierResponseDTO.class);
        
        dto.setId(supplier.getId());
        dto.setName(supplier.getUser().getUsername());
        dto.setEmail(supplier.getUser().getEmail());

        dto.setCompanyName(supplier.getCompanyName());

        if (supplier.getCategory() != null) {
            dto.setCategoryId(supplier.getCategory().getId());
            dto.setCategoryName(supplier.getCategory().getCategoryName());
        }

        dto.setRating(supplier.getRating());
        dto.setIsActive(supplier.getIsActive());
        dto.setIsVerified(supplier.getIsVerified());

        return dto;
    }

    public List<AllSupplierResponseDTO> getAllSuppliers() {
        return supplierRepo.findAll()
                .stream()
                .map(supplier -> {
                    AllSupplierResponseDTO dto = new AllSupplierResponseDTO();
                    dto.setId(supplier.getId());
                    dto.setName(supplier.getUser().getFullName());
                    dto.setAddress(supplier.getAddress());
                    dto.setEmail(supplier.getUser().getEmail());
                    dto.setPhone(supplier.getPhone());
                    dto.setCompanyName(supplier.getCompanyName());
                    dto.setCategoryName(supplier.getCategory().getCategoryName());
                    dto.setIsVerified(supplier.getIsVerified());
                    dto.setRating(supplier.getRating());
                    dto.setIsActive(supplier.getIsActive());

                    List<SupplierDocument> documents = supplierDocumentRepo.findBySupplier_Id(supplier.getId());

                    dto.setSupplierDocumentList(documents);

                    return dto;
                })
                .toList();
    }

    public SupplierResponseDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Supplier not found"));

        return convertToDTO(supplier);
    }

    @Transactional
    public SupplierResponseDTO createSupplier(SupplierRequestDTO dto) {

        User user = currentUser.get();
        
        if (supplierRepo.existsByUser_Id(user.getId())) {
                throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Supplier profile already exists");
        }

        if (user.getRole() != Role.SUPPLIER) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Only supplier accounts can create supplier profile");
        }

        
        ProductCategory category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Category not found"));

        Supplier supplier = Supplier.builder()
                .user(user)
                .companyName(dto.getCompanyName())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .category(category)
                .rating(dto.getRating() == null ? BigDecimal.ZERO : dto.getRating())
                .isActive(dto.getIsActive() == null ? true : dto.getIsActive())
                .build();

        Supplier saved = supplierRepo.save(supplier);

        return convertToDTO(saved);
    }

    @Transactional
    public SupplierResponseDTO updateSupplier(SupplierRequestDTO dto) {

        User user = currentUser.get();

        Supplier supplier = supplierRepo.findByUser_Id(user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Supplier profile not found"));

        ProductCategory category = categoryRepo.findById(dto.getCategoryId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Category not found"));

        supplier.setCompanyName(dto.getCompanyName());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setCategory(category);

        // Supplier should not change rating
        // Supplier should not activate/deactivate himself

        Supplier updated = supplierRepo.save(supplier);

        return convertToDTO(updated);
    }

    public SupplierResponseDTO getMyProfile() {

        User user = currentUser.get();

        Supplier supplier = supplierRepo.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Supplier profile not found"));

        return convertToDTO(supplier);
    }

    @Transactional
    public String deleteSupplier(Long id) {
            Supplier supplier = supplierRepo.findById(id)
                            .orElseThrow(() -> new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Supplier not found"));

            supplierRepo.delete(supplier);

            return "Supplier deleted successfully";
    }
    
    @Transactional
    public String activateSupplier(Long id) {

        Supplier supplier = supplierRepo.findById(id)
            .orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Supplier not found"));

        supplier.setIsActive(true);

        supplierRepo.save(supplier);

        return "Supplier activated successfully";
    }

    @Transactional
    public String deactivateSupplier(Long id) {

        Supplier supplier = supplierRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Supplier not found"));

        supplier.setIsActive(false);

        supplierRepo.save(supplier);

        return "Supplier deactivated successfully";
    }

    public List<SupplierResponseDTO> getSuppliersByCategoryId(Long categoryId) {

        return supplierRepo.findByCategoryIdAndIsActiveTrueAndIsVerifiedTrue(categoryId)
                .stream()
                .map(this::convertToDTO)
                .toList();

    }

    public String verifySupplier(Long id) {

        Supplier supplier = supplierRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier Not Found"));

        if(supplier.getIsVerified()){
            throw new RuntimeException("Supplier Already Verified");
        }

        supplier.setIsVerified(true);
        supplierRepo.save(supplier);

        return "Verified";
    }

    public String unverifySupplier(Long id) {

        Supplier supplier = supplierRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier Not Found"));

        if(!supplier.getIsVerified()){
            throw new RuntimeException("Supplier Already Not Verified");
        }

        supplier.setIsVerified(false);
        supplierRepo.save(supplier);

        return "Marked as UnVerified";
    }
}

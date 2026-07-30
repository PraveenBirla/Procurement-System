package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.SupplierRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierResponseDTO;
import com.eps.enterprise_procurement_system.entities.ProductCategory;
import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.repositories.ProductCategoryRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierRepo;

import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepo supplierRepo;
    private final ProductCategoryRepo categoryRepo;
    private final ModelMapper modelMapper;

    private SupplierResponseDTO convertToDTO(Supplier supplier) {

        SupplierResponseDTO dto = modelMapper.map(supplier, SupplierResponseDTO.class);

        if (supplier.getCategory() != null) {
            dto.setCategoryId(supplier.getCategory().getId());
            dto.setCategoryName(supplier.getCategory().getCategoryName());
        }

        dto.setRating(supplier.getRating());
        dto.setIsActive(supplier.getIsActive());

        return dto;
    }

    public List<SupplierResponseDTO> getAllSuppliers() {
        return supplierRepo.findAll()
                .stream()
                .map(this::convertToDTO)
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
        ProductCategory category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Category not found"));

        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .category(category)
                .rating(dto.getRating())
                .isActive(dto.getIsActive() == null ? true : dto.getIsActive())
                .build();

        Supplier saved = supplierRepo.save(supplier);

        return convertToDTO(saved);
    }

    @Transactional
    public SupplierResponseDTO updateSupplier(Long id, SupplierRequestDTO dto) {
        Supplier supplier = supplierRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Supplier not found"));

        ProductCategory category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Category not found"));

        supplier.setName(dto.getName());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setCategory(category);
        supplier.setRating(dto.getRating());
        supplier.setIsActive(dto.getIsActive());

        Supplier updated = supplierRepo.save(supplier);

        return convertToDTO(updated);
    }

    @Transactional
    public String deleteSupplier(Long id) {
        Supplier supplier = supplierRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Supplier not found"));

        supplierRepo.delete(supplier);

        return "Supplier deleted successfully";
    }

    public List<SupplierResponseDTO> getSuppliersByCategoryId(Long categoryId) {

        return supplierRepo.findByCategoryId(categoryId)
                .stream()
                .map(this::convertToDTO)
                .toList();

    }
}

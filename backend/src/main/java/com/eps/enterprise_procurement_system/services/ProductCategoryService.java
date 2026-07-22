package com.eps.enterprise_procurement_system.services;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eps.enterprise_procurement_system.dto.ProductCategoryRequestDTO;
import com.eps.enterprise_procurement_system.dto.ProductCategoryResponseDTO;
import com.eps.enterprise_procurement_system.entities.ProductCategory;
import com.eps.enterprise_procurement_system.repositories.ProductCategoryRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryRepo productCategoryRepo;
    private final ModelMapper modelMapper;

    public List<ProductCategoryResponseDTO> getAllCategories() {

        return productCategoryRepo.findAll()
                .stream()
                .map(category -> modelMapper.map(category, ProductCategoryResponseDTO.class))
                .toList();
    }

    public ProductCategoryResponseDTO getCategoryById(Long id) {

        ProductCategory category = productCategoryRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product category not found"));

        return modelMapper.map(category, ProductCategoryResponseDTO.class);
    }

    public ProductCategoryResponseDTO createCategory(ProductCategoryRequestDTO dto) {

        productCategoryRepo.findByCategoryName(dto.getCategoryName())
                .ifPresent(c -> {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Category already exists");
                });

        ProductCategory category = ProductCategory.builder()
                .categoryName(dto.getCategoryName())
                .description(dto.getDescription())
                .build();

        ProductCategory saved = productCategoryRepo.save(category);

        return modelMapper.map(saved, ProductCategoryResponseDTO.class);
    }

    public ProductCategoryResponseDTO updateCategory(Long id, ProductCategoryRequestDTO dto) {

        ProductCategory category = productCategoryRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product category not found"));

        category.setCategoryName(dto.getCategoryName());
        category.setDescription(dto.getDescription());

        ProductCategory updated = productCategoryRepo.save(category);

        return modelMapper.map(updated, ProductCategoryResponseDTO.class);
    }

    public void deleteCategory(Long id) {

        ProductCategory category = productCategoryRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product category not found"));

        productCategoryRepo.delete(category);
    }

}

package com.eps.enterprise_procurement_system.services;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eps.enterprise_procurement_system.dto.ProductRequestDTO;
import com.eps.enterprise_procurement_system.dto.ProductResponseDTO;
import com.eps.enterprise_procurement_system.entities.Product;
import com.eps.enterprise_procurement_system.entities.ProductCategory;
import com.eps.enterprise_procurement_system.repositories.ProductCategoryRepo;
import com.eps.enterprise_procurement_system.repositories.ProductRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepo productRepo;
    private final ProductCategoryRepo categoryRepo;
    private final ModelMapper modelMapper;

    public List<ProductResponseDTO> getAllProducts() {

        return productRepo.findAll()
                .stream()
                .map(pro -> modelMapper.map(pro, ProductResponseDTO.class))
                .toList();
    }

    public ProductResponseDTO getProductById(Long id) {

        Product product = productRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"));

        return modelMapper.map(product, ProductResponseDTO.class);
    }

    public ProductResponseDTO createProduct(ProductRequestDTO dto) {

        productRepo.findBySku(dto.getSku())
                .ifPresent(p -> {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Product SKU already exists");
                });

        ProductCategory category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Category not found"));

        Product product = Product.builder()
                .sku(dto.getSku())
                .name(dto.getName())
                .category(category)
                .unit(dto.getUnit())
                .standardPrice(dto.getStandardPrice())
                .description(dto.getDescription())
                .isActive(dto.getIsActive() == null ? true : dto.getIsActive())
                .build();

        Product saved = productRepo.save(product);

        return modelMapper.map(saved, ProductResponseDTO.class);
    }

    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO dto) {

        Product product = productRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"));

        ProductCategory category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Category not found"));

        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setCategory(category);
        product.setUnit(dto.getUnit());
        product.setStandardPrice(dto.getStandardPrice());
        product.setDescription(dto.getDescription());
        product.setIsActive(dto.getIsActive());

        Product updated = productRepo.save(product);

        return modelMapper.map(updated, ProductResponseDTO.class);
    }

    public void deleteProduct(Long id) {

        Product product = productRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"));

        productRepo.delete(product);
    }

    public List<ProductResponseDTO> getProductByCategoryId(Long categoryId) {

        return productRepo.findByCategoryIdAndIsActiveTrue(categoryId)
                .stream()
                .map(product -> modelMapper.map(product,ProductResponseDTO.class))
                .toList();
    }
}

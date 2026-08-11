package com.eps.enterprise_procurement_system.services;

import java.math.BigDecimal;
import java.util.List;

import com.eps.enterprise_procurement_system.dto.PoItemRequestDTO;
import com.eps.enterprise_procurement_system.dto.PoItemResponseDTO;
import com.eps.enterprise_procurement_system.entities.PoItem;
import com.eps.enterprise_procurement_system.entities.Product;
import com.eps.enterprise_procurement_system.entities.PurchaseOrder;
import com.eps.enterprise_procurement_system.repositories.PoItemRepo;
import com.eps.enterprise_procurement_system.repositories.ProductRepo;
import com.eps.enterprise_procurement_system.repositories.PurchaseOrderRepo;

import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class PoItemService {

    private final PoItemRepo poItemRepo;
    private final ProductRepo productRepo;
    private final PurchaseOrderRepo purchaseOrderRepo;
    private final ModelMapper modelMapper;

    private PoItemResponseDTO convertToDTO(PoItem item){

        PoItemResponseDTO dto = modelMapper.map(item, PoItemResponseDTO.class);

        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());

        dto.setTotalPrice(
                item.getUnitPrice()
                        .multiply(
                                BigDecimal.valueOf(item.getQuantity()))

        );

        return dto;
    }
    
    public List<PoItemResponseDTO> getItems(Long poId) {

        return poItemRepo.findByPurchaseOrder_Id(poId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }
    
    @Transactional
    public PoItemResponseDTO addItem(Long poId, PoItemRequestDTO dto) {

        PurchaseOrder order = purchaseOrderRepo.findById(poId).orElseThrow();

        Product product = productRepo.findById(dto.getProductId()).orElseThrow();

        PoItem item = PoItem.builder()
                .purchaseOrder(order)
                .product(product)
                .quantity(dto.getQuantity())
                .unitPrice(dto.getUnitPrice())
                .build();

        return convertToDTO(poItemRepo.save(item));
    }

    @Transactional
    public String deleteItem(Long itemId) {

        poItemRepo.deleteById(itemId);
        return "Purchase order item Deleted Successfully";
    }
    
    @Transactional
    public PoItemResponseDTO updateItem(Long itemId, PoItemRequestDTO dto) {

        PoItem item = poItemRepo.findById(itemId).orElseThrow();

        Product product = productRepo.findById(dto.getProductId()).orElseThrow();

        item.setProduct(product);
        item.setQuantity(dto.getQuantity());
        item.setUnitPrice(dto.getUnitPrice());

        return convertToDTO(poItemRepo.save(item));
    }
    

}

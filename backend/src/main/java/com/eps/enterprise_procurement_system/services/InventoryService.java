package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.InventoryRequestDTO;
import com.eps.enterprise_procurement_system.dto.InventoryResponseDTO;
import com.eps.enterprise_procurement_system.entities.Inventory;
import com.eps.enterprise_procurement_system.entities.Product;
import com.eps.enterprise_procurement_system.entities.PurchaseOrder;
import com.eps.enterprise_procurement_system.repositories.InventoryRepo;
import com.eps.enterprise_procurement_system.repositories.ProductRepo;
import com.eps.enterprise_procurement_system.repositories.PurchaseOrderRepo;
import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepo inventoryRepo;
    private final ProductRepo productRepo;
    private final PurchaseOrderRepo purchaseOrderRepo;
    private final ModelMapper modelMapper;

    private InventoryResponseDTO convertToDTO(Inventory inventory) {

        InventoryResponseDTO dto = modelMapper.map(inventory, InventoryResponseDTO.class);

        dto.setProductId(inventory.getProduct().getId());
        dto.setProductName(inventory.getProduct().getName());

        if (inventory.getLastPurchaseOrder() != null) {
            dto.setLastPurchaseOrderId(inventory.getLastPurchaseOrder().getId());
            dto.setPurchaseOrderNo(inventory.getLastPurchaseOrder().getPoNumber());
        }

        dto.setUpdatedAt(inventory.getUpdatedAt());

        return dto;
    }

    public List<InventoryResponseDTO> getAllInventory() {

        return inventoryRepo.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public InventoryResponseDTO getInventoryById(Long id) {

        Inventory inventory = inventoryRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Inventory not found"));

        return convertToDTO(inventory);
    }
    
    @Transactional
    public InventoryResponseDTO createInventory(InventoryRequestDTO dto) {

        inventoryRepo.findByProduct_Id(dto.getProductId())
        .ifPresent(i -> {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Inventory already exists for this product");
        });

        Product product = productRepo.findById(dto.getProductId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"));

        PurchaseOrder po = null;

        if (dto.getLastPurchaseOrderId() != null) {

            po = purchaseOrderRepo.findById(dto.getLastPurchaseOrderId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Purchase Order not found"));
        }

        Inventory inventory = Inventory.builder()
                .product(product)
                .quantityOnHand(dto.getQuantityOnHand())
                .warehouseLocation(dto.getWarehouseLocation())
                .lastPurchaseOrder(po)
                .build();

        Inventory saved = inventoryRepo.save(inventory);

        return convertToDTO(saved);
    }
    
    @Transactional
    public InventoryResponseDTO updateInventory(Long id, InventoryRequestDTO dto) {

        Inventory inventory = inventoryRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Inventory not found"));

        Product product = productRepo.findById(dto.getProductId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"));

        PurchaseOrder po = null;

        if (dto.getLastPurchaseOrderId() != null) {

            po = purchaseOrderRepo.findById(dto.getLastPurchaseOrderId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Purchase Order not found"));
        }

        inventory.setProduct(product);
        inventory.setQuantityOnHand(dto.getQuantityOnHand());
        inventory.setWarehouseLocation(dto.getWarehouseLocation());
        inventory.setLastPurchaseOrder(po);

        Inventory updated = inventoryRepo.save(inventory);

        return convertToDTO(updated);
    }

    @Transactional
    public String deleteInventory(Long id) {

        Inventory inventory = inventoryRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Inventory not found"));

        inventoryRepo.delete(inventory);

        return "Inventory deleted successfully";
    }
    

}

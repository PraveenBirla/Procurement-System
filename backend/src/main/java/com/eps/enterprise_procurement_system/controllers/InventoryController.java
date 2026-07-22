package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.InventoryRequestDTO;
import com.eps.enterprise_procurement_system.dto.InventoryResponseDTO;
import com.eps.enterprise_procurement_system.services.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryResponseDTO>>> getAll(){

        return ResponseEntity.ok(new ApiResponse<>(inventoryService.getAllInventory()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryResponseDTO>> get(@PathVariable Long id){

        return ResponseEntity.ok(new ApiResponse<>(inventoryService.getInventoryById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public ResponseEntity<ApiResponse<InventoryResponseDTO>> create(
            @Valid @RequestBody InventoryRequestDTO dto){

        return new ResponseEntity<>(new ApiResponse<>(inventoryService.createInventory(dto)),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public ResponseEntity<ApiResponse<InventoryResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody InventoryRequestDTO dto){

        return ResponseEntity.ok(new ApiResponse<>(inventoryService.updateInventory(id,dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id){

        return ResponseEntity.ok(new ApiResponse<>(inventoryService.deleteInventory(id)));
    }
}

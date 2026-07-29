package com.eps.enterprise_procurement_system.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.PoItemRequestDTO;
import com.eps.enterprise_procurement_system.dto.PoItemResponseDTO;
import com.eps.enterprise_procurement_system.services.PoItemService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/purchase-orders/{poId}/items")
@RequiredArgsConstructor
public class PoItemController {

        private final PoItemService poItemService;

        @GetMapping
        @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT')")
        public ResponseEntity<ApiResponse<List<PoItemResponseDTO>>> getItems(
                @PathVariable Long poId) {

            return ResponseEntity.ok(new ApiResponse<>(poItemService.getItems(poId)));
        }

        @PostMapping
        @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT')")
        public ResponseEntity<ApiResponse<PoItemResponseDTO>> addItem(@PathVariable Long poId, @RequestBody @Valid PoItemRequestDTO dto) {

            return ResponseEntity.ok(new ApiResponse<>(poItemService.addItem(poId, dto)));
        }

        @PutMapping("/{itemId}")
        @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT')")
        public ResponseEntity<ApiResponse<PoItemResponseDTO>> updateItem(@PathVariable Long itemId, @RequestBody @Valid PoItemRequestDTO dto) {

            return ResponseEntity.ok(new ApiResponse<>(poItemService.updateItem(itemId, dto)));
        }

        @DeleteMapping("/{itemId}")
        @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT')")
        public String deleteItem(@PathVariable Long itemId) {

            return poItemService.deleteItem(itemId);
        }
    }

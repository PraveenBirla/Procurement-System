package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.*;
import com.eps.enterprise_procurement_system.services.ReturnReplacementService;
import com.eps.enterprise_procurement_system.util.CurrentUser;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/return-replacements")
@RequiredArgsConstructor
public class ReturnReplacementController {

    private final ReturnReplacementService returnReplacementService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReturnReplacementResponseDTO>>
    create(@RequestBody ReturnReplacementRequestDTO dto, CurrentUser currentUser) {

        ReturnReplacementResponseDTO response = returnReplacementService.createReturn(
                        dto,
                        currentUser.get()
                );

        return new ResponseEntity<>(new ApiResponse<>(response), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReturnReplacementResponseDTO>>
    getById(@PathVariable Long id) {

        return ResponseEntity.ok(new ApiResponse<>(returnReplacementService.getById(id))
        );
    }
}
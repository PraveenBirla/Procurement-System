package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.SpendingReportResponseDTO;
import com.eps.enterprise_procurement_system.services.ReportService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/spending")
    public ResponseEntity<ApiResponse<SpendingReportResponseDTO>>
            getSpendingReport() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        reportService.getSpendingReport()
                )
        );
    }
}
package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.dto.report.SpendingReportDTO;
import com.eps.enterprise_procurement_system.services.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/spending")
    public ResponseEntity<SpendingReportDTO> getSpendingReport() {
        return ResponseEntity.ok(reportService.getSpendingReport());
    }
}

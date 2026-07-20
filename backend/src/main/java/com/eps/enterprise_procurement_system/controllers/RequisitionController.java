package com.eps.enterprise_procurement_system.controllers;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eps.enterprise_procurement_system.dto.RequisitionDTO.CreateRequest;
import com.eps.enterprise_procurement_system.dto.RequisitionDTO.DecisionRequest;
import com.eps.enterprise_procurement_system.entities.PurchaseRequisition;
import com.eps.enterprise_procurement_system.entities.RequisitionItem;
import com.eps.enterprise_procurement_system.services.RequisitionService;
import com.eps.enterprise_procurement_system.util.CurrentUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/requisitions")
@RequiredArgsConstructor
public class RequisitionController {

    private final RequisitionService service;
    private final CurrentUser currentUser;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public PurchaseRequisition create(@Valid @RequestBody CreateRequest req) {
        return service.create(req, currentUser.get());
    }

    @GetMapping
    public List<PurchaseRequisition> list(@RequestParam(required=false) String status) {
        return status == null ? service.findAll() : service.findByStatus(status);
    }

    @GetMapping("/mine")
    public List<PurchaseRequisition> mine() {
        return service.findByEmployee(currentUser.get().getId());
    }

    @GetMapping("/{id}")
    public PurchaseRequisition get(@PathVariable Long id) { return service.findById(id); }

    @GetMapping("/{id}/items")
    public List<RequisitionItem> items(@PathVariable Long id) { return service.itemsOf(id); }

    @PostMapping("/{id}/manager-decision")
    @PreAuthorize("hasRole('MANAGER')")
    public PurchaseRequisition manager(@PathVariable Long id, @Valid @RequestBody DecisionRequest req) {
        return service.decide(id, "manager", req, currentUser.get());
    }

    @PostMapping("/{id}/finance-decision")
    @PreAuthorize("hasRole('FINANCE')")
    public PurchaseRequisition finance(@PathVariable Long id, @Valid @RequestBody DecisionRequest req) {
        return service.decide(id, "finance", req, currentUser.get());
    }

    @PostMapping("/{id}/admin-decision")
    @PreAuthorize("hasRole('ADMIN')")
    public PurchaseRequisition admin(@PathVariable Long id, @Valid @RequestBody DecisionRequest req) {
        return service.decide(id, "higher_authority", req, currentUser.get());
    }
}

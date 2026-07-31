package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.SupplierAverageRatingDTO;
import com.eps.enterprise_procurement_system.dto.SupplierPerformanceRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierPerformanceResponseDTO;
import com.eps.enterprise_procurement_system.entities.PurchaseOrder;
import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.entities.SupplierPerformance;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.repositories.PurchaseOrderRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierPerformanceRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierRepo;
import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierPerformanceService {

    private final SupplierPerformanceRepo performanceRepo;
    private final SupplierRepo supplierRepo;
    private final PurchaseOrderRepo purchaseOrderRepo;
    private final ModelMapper modelMapper;

    private SupplierPerformanceResponseDTO convertToDTO(SupplierPerformance performance) {

        SupplierPerformanceResponseDTO dto = modelMapper.map(performance, SupplierPerformanceResponseDTO.class);

        dto.setSupplierId(performance.getSupplier().getId());
        dto.setSupplierName(performance.getSupplier().getUser().getFullName());

        if (performance.getPurchaseOrder() != null) {
            dto.setPurchaseOrderId(performance.getPurchaseOrder().getId());
            dto.setPurchaseOrderNo(performance.getPurchaseOrder().getPoNumber());
        }

        dto.setReviewedById(performance.getReviewedBy().getId());
        dto.setReviewedByName(performance.getReviewedBy().getFullName());

        return dto;
    }
    
    public SupplierAverageRatingDTO getSupplierAverageRating(Long supplierId){

        Supplier supplier = supplierRepo.findById(supplierId)
                        .orElseThrow(() -> new ResponseStatusException(
                                        HttpStatus.NOT_FOUND, "Supplier not found"));

        List<SupplierPerformance> reviews = performanceRepo.findBySupplier_Id(supplierId);

        SupplierAverageRatingDTO dto = new SupplierAverageRatingDTO();

        dto.setSupplierId(supplier.getId());
        dto.setSupplierName(supplier.getUser().getFullName());

        dto.setTotalReviews(reviews.size());

        if(reviews.isEmpty()){
            dto.setAverageRating(BigDecimal.ZERO);
            return dto;
        }

        BigDecimal total = BigDecimal.ZERO;

        for(SupplierPerformance review : reviews){
            total = total.add(review.getOverallRating());
        }

        dto.setAverageRating(
                total.divide(
                        BigDecimal.valueOf(reviews.size()), 2, RoundingMode.HALF_UP));

        return dto;
    }

    public SupplierPerformanceResponseDTO createPerformance(SupplierPerformanceRequestDTO dto, User reviewer) {

        Supplier supplier = supplierRepo.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Supplier not found"));

        PurchaseOrder purchaseOrder = null;

        if (dto.getPurchaseOrderId() != null) {

            purchaseOrder = purchaseOrderRepo.findById(dto.getPurchaseOrderId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Purchase Order not found"));
        }

        if (dto.getPurchaseOrderId() != null) {

            performanceRepo.findBySupplier_IdAndPurchaseOrder_IdAndReviewedBy_Id(
                    dto.getSupplierId(),
                    dto.getPurchaseOrderId(),
                    dto.getReviewedById())
                    .ifPresent(review -> {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "You have already reviewed this supplier for this purchase order.");
                    });
        }

        BigDecimal overall = dto.getQualityRating()
                .add(dto.getDeliveryRating())
                .add(dto.getPriceRating())
                .divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);

        SupplierPerformance performance = SupplierPerformance.builder()
                .supplier(supplier)
                .purchaseOrder(purchaseOrder)
                .qualityRating(dto.getQualityRating())
                .deliveryRating(dto.getDeliveryRating())
                .priceRating(dto.getPriceRating())
                .overallRating(overall)
                .reviewDate(dto.getReviewDate() == null ? LocalDate.now() : dto.getReviewDate())
                .reviewedBy(reviewer)
                .build();

        SupplierPerformance saved = performanceRepo.save(performance);

        return convertToDTO(saved);
    }

    public List<SupplierPerformanceResponseDTO> getAllPerformances() {

        return performanceRepo.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public SupplierPerformanceResponseDTO getPerformanceById(Long id) {

        SupplierPerformance performance = performanceRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Performance not found"));

        return convertToDTO(performance);
    }
    
    public List<SupplierPerformanceResponseDTO> getSupplierPerformances(Long supplierId) {

        return performanceRepo.findBySupplier_Id(supplierId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public SupplierPerformanceResponseDTO updatePerformance(Long id, SupplierPerformanceRequestDTO dto) {

        SupplierPerformance performance = performanceRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Performance not found"));

        performance.setQualityRating(dto.getQualityRating());
        performance.setDeliveryRating(dto.getDeliveryRating());
        performance.setPriceRating(dto.getPriceRating());

        BigDecimal overall = dto.getQualityRating()
                .add(dto.getDeliveryRating())
                .add(dto.getPriceRating())
                .divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);

        performance.setOverallRating(overall);

        performance.setReviewDate(dto.getReviewDate());

        SupplierPerformance updated = performanceRepo.save(performance);

        return convertToDTO(updated);
    }

    public String deletePerformance(Long id) {

        SupplierPerformance performance = performanceRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Performance not found"));

        performanceRepo.delete(performance);

        return "Supplier performance deleted successfully";
    }
}
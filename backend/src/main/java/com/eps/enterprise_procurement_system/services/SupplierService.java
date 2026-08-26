package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.AllSupplierResponseDTO;
import com.eps.enterprise_procurement_system.dto.SupplierRequestDTO;
import com.eps.enterprise_procurement_system.dto.SupplierResponseDTO;
import com.eps.enterprise_procurement_system.dto.VendorRecommendationDTO;
import com.eps.enterprise_procurement_system.dto.VendorRecommendationResponseDTO;
import com.eps.enterprise_procurement_system.entities.ProductCategory;
import com.eps.enterprise_procurement_system.entities.Supplier;
import com.eps.enterprise_procurement_system.entities.SupplierDocument;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.entities.enums.Role;
import com.eps.enterprise_procurement_system.entities.enums.VerificationStatus;
import com.eps.enterprise_procurement_system.repositories.ProductCategoryRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierDocumentRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierRepo;
import com.eps.enterprise_procurement_system.repositories.SupplierPerformanceRepo;
import com.eps.enterprise_procurement_system.repositories.UserRepository;
import com.eps.enterprise_procurement_system.util.CurrentUser;

import lombok.RequiredArgsConstructor;

import org.apache.xmlbeans.impl.xb.xsdschema.NamedGroup;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.math.RoundingMode;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepo supplierRepo;
    private final ProductCategoryRepo categoryRepo;
    private final ModelMapper modelMapper;
    private final CurrentUser currentUser;
    private final SupplierDocumentRepo supplierDocumentRepo;
    private final UserRepository userRepository;
    private final SupplierPerformanceRepo supplierPerformanceRepo;

    private SupplierResponseDTO convertToDTO(Supplier supplier) {

        SupplierResponseDTO dto = modelMapper.map(supplier, SupplierResponseDTO.class);
        
        dto.setId(supplier.getId());
        dto.setName(supplier.getUser().getUsername());
        dto.setEmail(supplier.getUser().getEmail());

        dto.setCompanyName(supplier.getCompanyName());
        if (supplier.getStatus() == VerificationStatus.VERIFIED) {
            dto.setIsVerified(true);
        }
        else {
            dto.setIsVerified(false);
        }

        if (supplier.getCategory() != null) {
            dto.setCategoryId(supplier.getCategory().getId());
            dto.setCategoryName(supplier.getCategory().getCategoryName());
        }

        dto.setRating(supplier.getRating());
        dto.setIsActive(supplier.getIsActive());

        return dto;
    }

    public List<AllSupplierResponseDTO> getAllSuppliers() {
        return supplierRepo.findAll()
                .stream()
                .map(supplier -> {
                    AllSupplierResponseDTO dto = new AllSupplierResponseDTO();
                    dto.setId(supplier.getId());
                    dto.setName(supplier.getUser().getFullName());
                    dto.setAddress(supplier.getAddress());
                    dto.setEmail(supplier.getUser().getEmail());
                    dto.setPhone(supplier.getPhone());
                    dto.setCompanyName(supplier.getCompanyName());
                    dto.setCategoryId(supplier.getCategory().getId());
                    dto.setCategoryName(supplier.getCategory().getCategoryName());
                    dto.setRating(supplier.getRating());
                    dto.setIsActive(supplier.getIsActive());
                    dto.setStatus(supplier.getStatus());
                    List<SupplierDocument> documents = supplierDocumentRepo.findBySupplier_Id(supplier.getId());

                    dto.setSupplierDocumentList(documents);

                    return dto;
                })
                .toList();
    }

    public SupplierResponseDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Supplier not found"));

        return convertToDTO(supplier);
    }

    @Transactional
    public SupplierResponseDTO createSupplier(SupplierRequestDTO dto) {

        User user = currentUser.get();
        
        if (supplierRepo.existsByUser_Id(user.getId())) {
                throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Supplier profile already exists");
        }

        if (user.getRole() != Role.SUPPLIER) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Only supplier accounts can create supplier profile");
        }

        
        ProductCategory category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Category not found"));

        Supplier supplier = Supplier.builder()
                .user(user)
                .companyName(dto.getCompanyName())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .category(category)
                .rating(dto.getRating() == null ? BigDecimal.ZERO : dto.getRating())
                .isActive(dto.getIsActive() == null ? true : dto.getIsActive())
                .build();

        Supplier saved = supplierRepo.save(supplier);

        return convertToDTO(saved);
    }

    @Transactional
    public SupplierResponseDTO updateSupplier(SupplierRequestDTO dto) {

        User user = currentUser.get();

        Supplier supplier = supplierRepo.findByUser_Id(user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Supplier profile not found"));

        ProductCategory category = categoryRepo.findById(dto.getCategoryId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Category not found"));

        supplier.setCompanyName(dto.getCompanyName());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setCategory(category);

        // Supplier should not change rating
        // Supplier should not activate/deactivate himself

        Supplier updated = supplierRepo.save(supplier);

        return convertToDTO(updated);
    }

    public SupplierResponseDTO getMyProfile() {

        User user = currentUser.get();

        Supplier supplier = supplierRepo.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Supplier profile not found"));

        return convertToDTO(supplier);
    }

    @Transactional
    public String deleteSupplier(Long id) {
            Supplier supplier = supplierRepo.findById(id)
                            .orElseThrow(() -> new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Supplier not found"));

            supplierRepo.delete(supplier);

            return "Supplier deleted successfully";
    }
    
    @Transactional
    public String activateSupplier(Long id) {

        Supplier supplier = supplierRepo.findById(id)
            .orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Supplier not found"));

        User user = supplier.getUser();
        user.setIsActive(true);

        supplier.setIsActive(true);
        return "Supplier activated successfully";
    }

    @Transactional
    public String deactivateSupplier(Long id) {

        Supplier supplier = supplierRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Supplier not found"));

        User user = supplier.getUser();
        user.setIsActive(false);
        supplier.setIsActive(false);

        return "Supplier deactivated successfully";
    }

    public List<SupplierResponseDTO> getVerifiedSuppliersByCategoryId(Long categoryId, VerificationStatus status) {

            return supplierRepo.findByCategoryIdAndIsActiveTrueAndStatus(categoryId, status)
                    .stream()
                    .map(this::convertToDTO)
                    .toList();
    }

    /** Ranks only the existing active, verified suppliers for one category. */
    public VendorRecommendationResponseDTO getRecommendations(Long categoryId) {
        List<Supplier> eligible = supplierRepo.findByCategoryIdAndIsActiveTrueAndStatus(categoryId, VerificationStatus.VERIFIED);
        if (eligible.isEmpty()) {
            return VendorRecommendationResponseDTO.builder().vendors(List.of()).build();
        }

        List<Candidate> candidates = eligible.stream().map(this::toCandidate).toList();
        BigDecimal highestPriceRating = candidates.stream().map(Candidate::priceRating).max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);

        List<VendorRecommendationDTO> vendors = candidates.stream()
                .map(candidate -> toRecommendation(candidate, highestPriceRating))
                .sorted(Comparator.comparing(VendorRecommendationDTO::getRecommendationScore).reversed()
                        .thenComparing(VendorRecommendationDTO::getSupplierName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        for (int index = 0; index < vendors.size(); index++) {
            VendorRecommendationDTO vendor = vendors.get(index);
            vendor.setRecommendationRank(index + 1);
            vendor.setRecommended(index == 0);
            vendor.setRecommendationReason(index == 0
                    ? "Highest weighted score from supplier rating, price competitiveness, delivery performance and verified active eligibility."
                    : "Ranked using supplier rating, price competitiveness, delivery performance and verified active eligibility.");
        }
        return VendorRecommendationResponseDTO.builder().recommendedVendor(vendors.get(0)).vendors(vendors).build();
    }

    private Candidate toCandidate(Supplier supplier) {
        var reviews = supplierPerformanceRepo.findBySupplier_Id(supplier.getId());
        BigDecimal delivery = average(reviews.stream().map(review -> review.getDeliveryRating()).toList());
        BigDecimal price = average(reviews.stream().map(review -> review.getPriceRating()).toList());
        BigDecimal rating = supplier.getRating() == null ? BigDecimal.ZERO : supplier.getRating();
        return new Candidate(supplier, rating, delivery, price);
    }

    private BigDecimal average(List<BigDecimal> values) {
        List<BigDecimal> present = values.stream().filter(java.util.Objects::nonNull).toList();
        if (present.isEmpty()) return BigDecimal.ZERO;
        return present.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(present.size()), 2, RoundingMode.HALF_UP);
    }

    private VendorRecommendationDTO toRecommendation(Candidate candidate, BigDecimal highestPriceRating) {
        // Ratings are stored on a 0-5 scale. Missing optional reviews contribute zero, never an API failure.
        BigDecimal ratingScore = candidate.rating().min(BigDecimal.valueOf(5)).multiply(BigDecimal.valueOf(8));
        BigDecimal deliveryScore = candidate.deliveryRating().min(BigDecimal.valueOf(5)).multiply(BigDecimal.valueOf(4));
        BigDecimal priceScore = highestPriceRating.signum() == 0 ? BigDecimal.ZERO
                : candidate.priceRating().divide(highestPriceRating, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(30));
        BigDecimal score = ratingScore.add(deliveryScore).add(priceScore).add(BigDecimal.TEN)
                .setScale(2, RoundingMode.HALF_UP);
        return VendorRecommendationDTO.builder().supplierId(candidate.supplier().getId())
                .supplierName(candidate.supplier().getCompanyName())
                .categoryName(candidate.supplier().getCategory().getCategoryName())
                .rating(candidate.rating()).deliveryRating(candidate.deliveryRating()).priceRating(candidate.priceRating())
                .recommendationScore(score).build();
    }

    private record Candidate(Supplier supplier, BigDecimal rating, BigDecimal deliveryRating, BigDecimal priceRating) { }

    public String updateSupplierVerification(Long id, String status) {
        Supplier supplier = supplierRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found"));

        VerificationStatus verificationStatus;

        try {
            verificationStatus = VerificationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid verification status: " + status);
        }

        supplier.setStatus(verificationStatus);

        supplierRepo.save(supplier);

        return "Supplier verification status updated to " + verificationStatus;
    }

    // public String verifySupplier(Long id) {

    //     Supplier supplier = supplierRepo.findById(id)
    //             .orElseThrow(() -> new RuntimeException("Supplier Not Found"));

    //     if (supplier.getStatus() == VerificationStatus.VERIFIED) {
    //         throw new RuntimeException("Supplier Already Verified");
    //     }

    //     // if()
    //     supplier.setStatus(VerificationStatus.VERIFIED);
    //     supplierRepo.save(supplier);

    //     return "Verified";
    // }

    // public String unverifySupplier(Long id) {

    //     Supplier supplier = supplierRepo.findById(id)
    //             .orElseThrow(() -> new RuntimeException("Supplier Not Found"));

    //     if(!supplier.getIsVerified()){
    //         throw new RuntimeException("Supplier Already Not Verified");
    //     }

    //     supplier.setIsVerified(false);
    //     supplierRepo.save(supplier);

    //     return "Marked as UnVerified";
    // }
}

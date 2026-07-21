package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionRequestDTO;
import com.eps.enterprise_procurement_system.dto.RequisitionItemRequestDTO;
import com.eps.enterprise_procurement_system.entities.*;
import com.eps.enterprise_procurement_system.entities.enums.RequisitionStatus;
import com.eps.enterprise_procurement_system.repositories.ProductRepo;
import com.eps.enterprise_procurement_system.repositories.PurchaseRequisitionRepo;
import com.eps.enterprise_procurement_system.repositories.RequisitionStatusHistoryRepo;
import com.eps.enterprise_procurement_system.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseRequisitionService {

    private final PurchaseRequisitionRepo repo;
    private final UserRepository userRepository;
    private final ProductRepo productRepo;
    private final PurchaseRequisitionRepo purchaseRequisitionRepo;
    private final RequisitionStatusHistoryRepo statusHistoryRepo;

    @Transactional
    public  String createRequisition(Long id, PurchaseRequisitionRequestDTO dto) {
        User employee =  userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        PurchaseRequisition requisition = PurchaseRequisition.builder()
                .requisitionNo("REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .employee(employee)
                .title(dto. getTitle())
                .description(dto.getDescription())
                .status(RequisitionStatus.DRAFT)
                .isDuplicate(false)
                .build();

        List<RequisitionItem> items = new ArrayList<>();

         BigDecimal total = BigDecimal.ZERO;

         for(RequisitionItemRequestDTO  itemRequestDTO : dto.getItems()){

             Product product = productRepo.findById(itemRequestDTO.getProductId())
                     .orElseThrow(() -> new ResponseStatusException(
                             HttpStatus.NOT_FOUND,
                             "Product not found"
                     ));

              RequisitionItem item = RequisitionItem.builder()
                      .requisition(requisition)
                      .product(product)
                      .quantity(itemRequestDTO.getQuantity())
                      .unitPrice(itemRequestDTO.getUnitPrice())
                      .build();

             items.add(item);

             total = total.add(
                      itemRequestDTO.getUnitPrice()
                             .multiply(BigDecimal.valueOf(itemRequestDTO.getQuantity()))
             );


         }

         requisition.setItems(items);
         requisition.setTotalEstimatedAmount(total);
         purchaseRequisitionRepo.save(requisition);


         statusHistoryRepo.save(RequisitionStatusHistory.builder()
                 .requisition(requisition)
                 .newStatus(RequisitionStatus.PENDING_MANAGER)
                 .changedBy(employee)
                 .remarks("Submitted for manager approval")
                 .build());


         return "requition submited";
    }


    public List<PurchaseRequisition> getAllRequisitions() {
        return repo.findAll();
    }

    public PurchaseRequisition getRequisitionById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Requisition not found"));
    }



    @Transactional
    public void deleteRequisition(Long id) {
        repo.deleteById(id);
    }
}

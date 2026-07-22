package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionRequestDTO;
import com.eps.enterprise_procurement_system.dto.PurchaseRequisitionResponseDTO;
import com.eps.enterprise_procurement_system.dto.RequisitionItemRequestDTO;
import com.eps.enterprise_procurement_system.dto.RequisitionItemResponseDTO;
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
                .status(RequisitionStatus.PENDING_MANAGER)
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


    @Transactional
    public List<PurchaseRequisitionResponseDTO> getAllRequisitions() {

         List<PurchaseRequisitionResponseDTO> list= purchaseRequisitionRepo.findAll()
                 .stream().map(
                         purchaseRequisition -> {
                             PurchaseRequisitionResponseDTO  dto = new PurchaseRequisitionResponseDTO();
                             dto.setId(purchaseRequisition.getId());
                             dto.setRequitionNo(purchaseRequisition.getRequisitionNo());
                             dto.setEmployeeName(purchaseRequisition.getEmployee().getFullName());
                             dto.setTitle(purchaseRequisition.getTitle());
                             dto.setDescription(purchaseRequisition.getDescription());
                             dto.setTotalEstimatedAmount(purchaseRequisition.getTotalEstimatedAmount());
                             dto.setStatus(purchaseRequisition.getStatus());
                             dto.setIsDuplicate(purchaseRequisition.getIsDuplicate());
                             dto.setCreatedAt(purchaseRequisition.getCreatedAt());

                             List<RequisitionItemResponseDTO> itemsDTOs = purchaseRequisition.getItems()
                                     .stream().map(item -> {
                                         RequisitionItemResponseDTO itemDto = new RequisitionItemResponseDTO();
                                         itemDto.setId(item.getId());
                                         itemDto.setProductId(item.getProduct().getId());
                                         itemDto.setProductName((item.getProduct().getName()));
                                         itemDto.setQuantity(item.getQuantity());
                                         itemDto.setUnitPrice(item.getUnitPrice());

                                         return itemDto;
                                     }).toList();

                             dto.setItems(itemsDTOs);
                             return dto;
                         }
                 ).toList();
            return list;
         }


    public  List<PurchaseRequisitionResponseDTO> getRequisitionByEmployeeId(Long id) {

        List<PurchaseRequisitionResponseDTO> list= purchaseRequisitionRepo.findByEmployee_Id(id)
                .stream().map(
                        purchaseRequisition -> {
                            PurchaseRequisitionResponseDTO  dto = new PurchaseRequisitionResponseDTO();
                            dto.setId(purchaseRequisition.getId());
                            dto.setRequitionNo(purchaseRequisition.getRequisitionNo());
                            dto.setEmployeeName(purchaseRequisition.getEmployee().getFullName());
                            dto.setTitle(purchaseRequisition.getTitle());
                            dto.setDescription(purchaseRequisition.getDescription());
                            dto.setTotalEstimatedAmount(purchaseRequisition.getTotalEstimatedAmount());
                            dto.setStatus(purchaseRequisition.getStatus());
                            dto.setIsDuplicate(purchaseRequisition.getIsDuplicate());
                            dto.setCreatedAt(purchaseRequisition.getCreatedAt());

                            List<RequisitionItemResponseDTO> itemsDTOs = purchaseRequisition.getItems()
                                    .stream().map(item -> {
                                        RequisitionItemResponseDTO itemDto = new RequisitionItemResponseDTO();
                                        itemDto.setId(item.getId());
                                        itemDto.setProductId(item.getProduct().getId());
                                        itemDto.setProductName((item.getProduct().getName()));
                                        itemDto.setQuantity(item.getQuantity());
                                        itemDto.setUnitPrice(item.getUnitPrice());

                                        return itemDto;
                                    }).toList();

                            dto.setItems(itemsDTOs);
                            return dto;
                        }
                ).toList();
        return list;
    }



    @Transactional
    public void deleteRequisition(Long id) {
        repo.deleteById(id);
    }

    public List<PurchaseRequisitionResponseDTO> getRequisitionByStatus(String status) {


        List<PurchaseRequisitionResponseDTO> list= purchaseRequisitionRepo.findByStatus(status)
                .stream().map(
                        purchaseRequisition -> {
                            PurchaseRequisitionResponseDTO  dto = new PurchaseRequisitionResponseDTO();
                            dto.setId(purchaseRequisition.getId());
                            dto.setRequitionNo(purchaseRequisition.getRequisitionNo());
                            dto.setEmployeeName(purchaseRequisition.getEmployee().getFullName());
                            dto.setTitle(purchaseRequisition.getTitle());
                            dto.setDescription(purchaseRequisition.getDescription());
                            dto.setTotalEstimatedAmount(purchaseRequisition.getTotalEstimatedAmount());
                            dto.setStatus(purchaseRequisition.getStatus());
                            dto.setIsDuplicate(purchaseRequisition.getIsDuplicate());
                            dto.setCreatedAt(purchaseRequisition.getCreatedAt());

                            List<RequisitionItemResponseDTO> itemsDTOs = purchaseRequisition.getItems()
                                    .stream().map(item -> {
                                        RequisitionItemResponseDTO itemDto = new RequisitionItemResponseDTO();
                                        itemDto.setId(item.getId());
                                        itemDto.setProductId(item.getProduct().getId());
                                        itemDto.setProductName((item.getProduct().getName()));
                                        itemDto.setQuantity(item.getQuantity());
                                        itemDto.setUnitPrice(item.getUnitPrice());

                                        return itemDto;
                                    }).toList();

                            dto.setItems(itemsDTOs);
                            return dto;
                        }
                ).toList();
        return list;

    }
}

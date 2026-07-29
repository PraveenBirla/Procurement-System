package com.eps.enterprise_procurement_system.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.eps.enterprise_procurement_system.entities.PurchaseOrder;

@Service
public class ExcelService {

    public byte[] exportPurchaseOrders(List<PurchaseOrder> orders){
        return new byte[5];
    }

}

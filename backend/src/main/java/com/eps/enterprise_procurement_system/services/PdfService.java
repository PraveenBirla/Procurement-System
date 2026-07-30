package com.eps.enterprise_procurement_system.services;

import org.springframework.stereotype.Service;

import com.eps.enterprise_procurement_system.entities.PurchaseOrder;

@Service
public class PdfService {

    public byte[] generatePurchaseOrder(PurchaseOrder order){
        return new byte[5];
    }

    public byte[] generateInvoice(PurchaseOrder order){
        return new byte[5];
    }

    public byte[] generateGoodsReceipt(PurchaseOrder order){
        return new byte[5];
    }

}
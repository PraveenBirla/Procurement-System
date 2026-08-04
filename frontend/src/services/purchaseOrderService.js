import api from './api';

const purchaseOrderService = {
   
  async generatePurchaseOrder(data){
    const res = await api.post("/purchase-orders", data);
       return res.data.data;
  },  

  async getPurchaseOrderHistory(poId){
     const res = await api.get(`/purchase-orders/${poId}/history` );
       return res.data.data;
  },
  
   async getPurchaseOrderRequisionId(requisitionId){
     const res = await api.get(`/purchase-orders/${requisitionId}/requisition` );
       return res.data.data;
  }, 

  async downloadePurchaseOrder(poId){
    const res = await api.get(`/purchase-orders/${poId}/pdf`, {
        responseType: "blob",
    });
       return res.data ;
  }, 

  async  sendToSupplier(poId){
    const res = await api.post(`/purchase-orders/${poId}/send`)
       return res.data.data ;
  }

}

export default purchaseOrderService;
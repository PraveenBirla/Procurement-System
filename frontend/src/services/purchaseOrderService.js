import api from './api';

const purchaseOrderService = {
   
  async generatePurchaseOrder(data){
    const res = await api.post("/purchase-orders", data);
       return res.data.data;
  },  

  async generatePurchaseOrderHistory(poId){
     const res = await api.get(`/purchase-orders/${poId}/history` );
       return res.data.data;
  }

}

export default purchaseOrderService;
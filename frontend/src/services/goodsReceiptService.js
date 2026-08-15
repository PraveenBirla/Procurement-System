import api from "./api";

const goodsReceiptService = {

  async getByPurchaseOrder(poId) {
    const res = await api.get(`/goods-receipts/purchase-order/${poId}`);
    return res.data.data;
  },

  async createGoodsReceipt(id, data) {
    const res = await api.post(`/goods-receipts/purchase-order/${id}`, data);
    return res.data.data;
  },

  async inspectGoodsReceipt(id, data) {
    const res = await api.put(`/goods-receipts/${id}/inspect`, data);
    return res.data.data;
  },

  async createReturnReplacement(data) {
    const res = await api.post("/return-replacements", data);
    return res.data.data;
  }

};

export default goodsReceiptService;
import api from './api';

const productService = {

  async getCategories(){
  const res = await api.get("/product-categories");
  return res.data.data;
 }, 

 async createCategories(data){
  const res = await api.post("/product-categories", data);
  return res.data.data;
 },

 async  deleteCategories(id){
  const res = await api.delete(`/product-categories/${id}`);
  return res.data.data;
 },

 async getProducts(){
  const res = await api.get("/products");
  return res.data.data;
},

async createProduct(product) {
  const res = await api.post("/products", product);
  return res.data;
},

async updateProduct(id , product ) {
  const res = await api.put(`/products/${id}`, product);
  return res.data;
},

async deleteProduct(id) {
  await api.delete(`/products/${id}`);
  return true;
}
 
};

export default productService;
import api from './api';

const  suppliersService = { 
 
  async getProfile(){
        const res = await api.get("/suppliers/me");
       return res.data.data;
  },
  
  async createProfile(data){
        const res = await api.post("/suppliers",data);
       return res.data.data;
  },

  async updateProfile(data){
        const res = await api.put("/suppliers/me", data);
       return res.data.data;
  },

  async getAllSuppliersByCategoriyId(id){
       const res = await api.get(`/suppliers/${id}/category`);
       return res.data.data;
     },

   async getAllDocumments(){
     const res = await api.get("/supplier-documents/my-documents");
       return res.data.data;
   }, 
   
   async uploadeDocumments(data){
     const res = await api.post("/supplier-documents", data);
       return res.data.data;
   }, 
   
   async updatedeDocumments(documentId, data){
     const res = await api.put(`/supplier-documents/${documentId}`, data);
       return res.data.data;
   }, 

   async deleteDocumments(documentId){
     const res = await api.delete(`/supplier-documents/${documentId}`);
       return res.data.data;
   } 





} 

export default suppliersService;
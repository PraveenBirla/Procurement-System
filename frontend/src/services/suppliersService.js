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
   
  //  async uploadeDocumments(data){
  //    const res = await api.post("/supplier-documents", data);
  //      return res.data.data;
  //  }, 
   
  //  async updatedeDocumments(documentId, data){
  //    const res = await api.put(`/supplier-documents/${documentId}`, data);
  //      return res.data.data;
  //  }, 

   async deleteDocumments(documentId){
     const res = await api.delete(`/supplier-documents/${documentId}`);
       return res.data.data;
   },
   
    async getSuppliersOrder(){
       const res = await api.get("/purchase-orders/supplier");
       return res.data.data;
     } ,
    
     async getSuppliersOrderByStatus(status){
       const res = await api.get("/purchase-orders/status/supplier",{
        params: {
         status,
        }
      });
       return res.data.data;
     },  

     async uploadDocument(documentType, file) {

    const formData = new FormData();

    formData.append("documentType", documentType);
    formData.append("file", file);

    const res = await api.post(
        "/supplier-documents/documents",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    ); 
    return res.data.data;
} ,

async updateDocument(documentId, file) {

    const formData = new FormData();

    formData.append("file", file);

    const res = await api.put(
        `/supplier-documents/documents/${documentId}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data.data;
}

 




} 

export default suppliersService;
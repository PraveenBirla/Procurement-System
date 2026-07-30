import api from './api';

const  suppliersService = { 

  async getAllSuppliersByCategoriyId(id){
       const res = await api.get(`/api/suppliers/${id}/category`);
       return res.data.data;
     }

} 

export default suppliersService;
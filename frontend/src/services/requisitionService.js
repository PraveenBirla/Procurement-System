import api from './api';

const requisitionService = {

     async getEmployeeRequisitions(){
       const res = await api.get("/requisitions/mine");
       return res.data.data;
     }, 

     async getAllRequisitions(){
      const res = await api.get("/requisitions/all");
      return res.data.data;
     },
     
     async createRequisition(requisition){
       const res = await api.post("/requisitions", requisition);
       return res.data.data;
     },

     async getRequisitionHistory(id){
       const res = await api.get(`/history/${id}`);
       return res.data.data;
     }, 

     async getRequisitionsByStatus(status){
      const res = await api.get("/requisitions",{
        params: {
         status,
        }
      }
      );
       return res.data.data;
     },  
     
     async getRequisitionsByStatusManager(status){
      const res = await api.get("/requisitions/manager",{
        params: {
         status,
        }
      }
      );
       return res.data.data;
     },  

     async getManagerUrgentCount(){
      const res = await api.get("/requisitions/manager/urgent/count");
      return res.data.data;
     },

     async getManagerUrgentRequisitions(){
      const res = await api.get("/requisitions/manager/urgent");
      return res.data.data;
     },


     async getManagerRequisitionsByStatus(status){
      const res = await api.get("/approvals/manager",{
        params: {
         status,
        }
      } 
      );
       return res.data.data;
     }, 

     async getFinanceRequisitionsByStatus(status){
      const res = await api.get("/approvals/finance",{
        params: {
         status,
        }
      }
      );
       return res.data.data;
     },

    async getProcurementRequisitionsByStatus(status){
      const res = await api.get("/approvals/procurement",{
        params: {
         status,
        }
      }
      );
       return res.data.data;
     },
     
     

     async managerUpdate(id, data){
      const res = await api.post(`/requisitions/${id}/manager-decision`, data);
       return res.data.data;
     },

    async  financeUpdate(id, data){
      const res = await api.post(`/requisitions/${id}/finance-decision`, data);
       return res.data.data;
     } ,

    async procurementUpdate(id, data){
      const res = await api.post(`/requisitions/${id}/procurement-decision`, data);
       return res.data.data;
    },

} 

export default requisitionService;

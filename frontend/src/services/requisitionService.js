import api from './api';

const requisitionService = {

     async getEmployeeRequisitions(){
       const res = await api.get("/requisitions/mine");
       return res.data.data;
     },
     
     async createRequisition(requisition){
       const res = await api.post("/requisitions", requisition);
       return res.data.data;
     },



     async getRequisitionHistory(id){
       const res = await api.get(`/history/${id}`);
       return res.data.data;
     }
} 

export default requisitionService;
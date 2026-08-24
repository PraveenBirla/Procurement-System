import api from "./api";

const reportService = {

    getSpendingReport: async () => {

        const response = await api.get("/reports/spending");

        return response.data.data;
    }

};

export default reportService;
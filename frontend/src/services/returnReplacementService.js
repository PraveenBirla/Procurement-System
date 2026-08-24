import api from "./api";

const returnReplacementService = {

    getSupplierPendingReturns: async () => {

        const response = await api.get("/return-replacements/supplier/pending");

        return response.data?.data || response.data;
    },

    updateSupplierStatus: async (id, status) => {

        const response = await api.put(`/return-replacements/${id}/supplier-status`,
                null,
                {
                    params: {
                        status
                    }
                }
            );

        return response.data?.data || response.data;
    }
};

export default returnReplacementService;
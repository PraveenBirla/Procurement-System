import api from './api';

const getSpendingReport = async () => {
    try {
        const response = await api.get(`/reports/spending`);
        return response.data.data; // Added .data here
    } catch (error) {
        console.error("Error fetching spending report:", error);
        throw error;
    }
};

export default {
    getSpendingReport
};

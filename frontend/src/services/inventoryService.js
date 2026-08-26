import api from './api';

const getAllInventory = async () => {
    const response = await api.get('/inventory');
    return response.data.data || [];
};

export default {
    getAllInventory
};

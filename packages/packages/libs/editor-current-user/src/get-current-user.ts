import { apiClient } from './api';

export const getCurrentUser = () => {
	return apiClient.get();
};
